'use strict';

var Firebase = require('../libraries/firebase').Firebase;
var FirebaseBaseController = require('./FirebaseBaseController').FirebaseBaseController;
var Slack = require('../libraries/slack').Alert;

var Item = require('./Item').Item;

var firebase = new Firebase();


class Character extends FirebaseBaseController{
    constructor(){
        super();
        this.firebaseType = 'character'
    }

    //Characters properties need to be set before calling this function.  Use setByProperty() or setByID() first
    resetActions(){
        console.log('called resetActions');

            return new Promise((resolve, reject)=>{

                var turnActionUsedUpdate = {
                    "turn_action_used": 0
                };

                //Reset the character's primary action used property
                firebase.update(('character/' + this.props.id), turnActionUsedUpdate)
                    .then( () => {

                        var singleActionUpdate = {
                            "turn_used": 0
                        };

                        var iterationIndex = 0;

                        var characterActionUpdatePromises = this.props.actions.map( singleAction => {

                            //console.log('resetting actions for character ID: ', this.props.id);
                            
                            return new Promise((resolve, reject)=>{

                                firebase.update(('character/' + this.props.id + '/actions/' + iterationIndex), singleActionUpdate)
                                    .then( updateResponse => {
                                        resolve();
                                    });

                                iterationIndex++;
                            })
                        });

                        Promise.all(characterActionUpdatePromises)
                            .then(()=>{
                                resolve();
                            });
                    })
            })
    }
    
    moveZone(destinationID, zoneDetails){
        return new Promise((resolve, reject) => {

            this.updateProperty("zone_id", destinationID)
                .then(()=>{
                    //Send slack alert that player was defeated
                    var alertDetails = {
                        "username": "A mysterious voice",
                        "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                        "channel": ("#" + zoneDetails.channel),
                        "text": this.props.name + " has left " + zoneDetails.name
                    };

                    //Create a new slack alert object
                    var channelAlert = new Slack(alertDetails);

                    //Send alert to slack
                    channelAlert.sendToSlack(channelAlert.params)
                        .then(() =>{
                            console.log('Successfully posted to slack')
                        })
                        .catch(error =>{
                            console.log('Error when sending to slack: ', error)
                        });

                    resolve();
                });
        });
    }

    purchaseItem(purchasedItem){

        return new Promise((resolve, reject)=>{

            //Decrement the player's gold locally
            var playerGold = this.props.gold - purchasedItem.props.cost;

            //Add the purchased item to unequipped inventory array
            this.props.inventory.unequipped.push(purchasedItem.props.id);

            //Update the character
            this.updateProperty("gold", playerGold)
            //firebase.update(tableRef, updates)
                .then(()=>{
                    //TODO need to modify the updateProperty to allow multiple updates in one call
                    this.updateProperty("inventory/unequipped", this.props.inventory.unequipped)
                        .then(()=>{
                            resolve()
                        })
                })
        })
    }

    equipItem(equippedItem){

        console.log('called equipItem');

        return new Promise((resolve, reject)=>{

            var equippedItems = [];

                //Iterate through the character's equipped items. (Array of item IDs)
                var equippedInventoryPromises = this.props.inventory.equipped.map( equipmentID => {

                    return new Promise((resolve, reject)=> {

                        //Lookup each item's properties
                        var singleEquipment = new Item();
                        singleEquipment.setByID(equipmentID)
                            .then(()=> {

                                //Iterate over that item's equipment_slots property adding to equippedSlots
                                singleEquipment.props.equipment_slots.forEach( equippedItemSlotID => {

                                    //console.log('equippedItemSlotID: ', equippedItemSlotID);

                                    equippedItems.push({
                                        "slot_id": equippedItemSlotID,
                                        "item_id": singleEquipment.props.id
                                    })
                                });

                                resolve();
                            })
                    })
                });

                //Now that we have an array of equipment objects in the format [ { slot_id: " ", item_id: ""  }, { slot_id: " ", item_id: ""  } ],
                // we can determine what items need to be unequipped
                Promise.all(equippedInventoryPromises)
                    .then(()=>{

                        var itemIDsToUnequip = [];

                        //Iterate through the equipped item objects to find all the slots that need to be unequipped
                        equippedItems.forEach( eachItem =>{

                            //Push item Ids to itemIDsToUnequip if they match the slot of an item attempting to equip
                            equippedItem.props.equipment_slots.forEach( slotID =>{

                                if (slotID == eachItem.slot_id && itemIDsToUnequip.indexOf(eachItem.item_id) === -1) {
                                    //console.log('Found an item id to unequip: ', eachItem.item_id);
                                    itemIDsToUnequip.push(eachItem.item_id)
                                }
                            });
                        });

                        /*
                        console.log('Final list of item Ids to unequip: ', JSON.stringify(itemIDsToUnequip));

                        //Now that we have an array of item IDs that need to be unequipped, iterate through them unequipping them
                        var unequippedInventoryPromises = itemIDsToUnequip.map( itemIDtoUnequip =>{
                            return new Promise(()=>{
                                this.unequipItem(itemIDtoUnequip)
                                    .then(()=>{
                                        resolve()
                                    });
                            })
                        });*/

                        function serialAsyncMap(collection, fn) {

                            let results = [];
                            let promise = Promise.resolve();

                            for (let item of collection) {
                                promise = promise.then(() => fn(item))
                                    .then(result => {
                                        console.log('resolved first item.');
                                        //console.log('resolved first item. inventory: ', JSON.stringify(this.props.inventory));
                                        results.push(result)
                                    });
                            }

                            //console.log('performed all iterations.');
                            //console.log('performed all iterations.  Inventory: ', JSON.stringify(this.props.inventory));
                            return promise.then(() => results);
                        }

                        serialAsyncMap(itemIDsToUnequip, this.unequipItem.bind(this));

                        /*
                        //Iterate through the equipped item's slots and find any matches and unequip them
                        var unequippedInventoryPromises = equippedItem.props.equipment_slots.map( slotID =>{

                            return new Promise((resolve, reject)=>{
                                //Iterate through equippedItems
                                equippedItems.forEach( eachItem =>{

                                   // console.log('slotID: ', slotID);
                                   // console.log('eachItem: ', eachItem);

                                    //If there is a match, add to the array of item IDs to unequip unless it already exists
                                    if (slotID == eachItem.slot_id && itemIDsToUnequip.indexOf(eachItem.item_id) === -1){

                                        console.log('Found an item that is currently equipped and should be unequipped: ', eachItem.item_id);

                                        //itemIDsToUnequip.push(eachItem.item_id);
                                        
                                        //Now that we have an array of item IDs that need to be unequipped, Iterate through them unequipping them.
                                        //This will update the server and .this character object
                                        this.unequipItem(eachItem.item_id)
                                            .then(()=>{
                                                console.log('Local inventory after item was unequipped: ', JSON.stringify(this.props.inventory));
                                                resolve()
                                            });
                                    } else {
                                        resolve()

                                    }
                                })
                            })
                        });*/

                        /*
                        //Wait until all equipment in inventory slots has been unequipped
                        //Then add the originally equipped item
                        Promise.all(unequippedInventoryPromises)
                            .then(()=>{

                                console.log('Finished unequipping items, current inventory: ', JSON.stringify(this.props.inventory));


                                //Create a local array for mutation
                                //var updatedEquipped = this.props.inventory.equipped;

                                //Add the unequipped item
                                //updatedEquipped.push(equippedItem);

                                this.props.inventory.equipped.push(equippedItem);

                                //var updatedUnequipped = this.props.inventory.unequipped;

                                //Remove the unequipped item from unequipped
                                this.props.inventory.unequipped.splice(this.props.inventory.unequipped.indexOf(equippedItem), 1);

                                //Build a new inventory object where equipped item has been moved to unequipped array
                                var updatedInventory = {
                                    equipped: this.props.inventory.equipped,
                                    unequipped: this.props.inventory.unequipped
                                };

                                //Update the character's inventory on the server
                                this.updateProperty('inventory', updatedInventory)
                                    .then( () => {
                                        resolve();
                                    });
                            })*/
                    });
            
            //TODO need to add functionality to remove effects from character's modified stats

            /*
            //Remove item from unequipped list
            var index = this.props.inventory.unequipped.indexOf(equippedItem.props.id);

            //Remove that array element
            if (index > -1) {
                this.props.inventory.unequipped.splice(index, 1);
            }

            //Look at item's "effects" object and set an array of those keys
            var effectsKeys = Object.keys(equippedItem.props.effects);

            //Iterate through the keys array
            var characterUpdatePromises = effectsKeys.map(effectKey=>{

                return new Promise((resolve, reject)=>{
                    var effectValue = equippedItem.props.effects[effectKey];

                    var newValue = this.props[effectKey] + effectValue;

                    this.updateProperty(effectKey, newValue)
                        .then(()=>{
                            resolve()
                        })
                })
            });*/
            
        })
    }

    //Argument passed is an item ID that should be currently equipped.
    //1.) Check that item ID passed is actually equipped
    //2.) Remove from equipped array & add to unequipped array in one DB call
    unequipItem(itemToUnequip){

        console.log('called unequipItem, item to unequip: ', itemToUnequip);

        return new Promise((resolve, reject)=>{

            resolve()

            //Verify that the item ID passed in is in the equipped array
            if (this.props.inventory.equipped.indexOf(itemToUnequip) === -1) {
                reject('ERROR - itemID is not equipped by this character')
            } else {

                //console.log('Unequipping, current inventory: ', JSON.stringify(this.props.inventory.equipped));

                //Create a local array for mutation
                //var updatedEquipped = this.props.inventory.equipped;

                //console.log('array element to splice: ', this.props.inventory.equipped.indexOf(itemToUnequip));

                //Remove the item from local equipped array
                this.props.inventory.equipped.splice(this.props.inventory.equipped.indexOf(itemToUnequip), 1);

                console.log('Updated equipped after splice: ', JSON.stringify(this.props.inventory.equipped));

                //Create a local array for mutation
                //var updatedUnequipped = this.props.inventory.unequipped;

                //Add the unequipped item to the local unequipped array
                this.props.inventory.unequipped.push(itemToUnequip);

                console.log('Updated unequipped after push: ', JSON.stringify(this.props.inventory.unequipped));

                //Build a new inventory object where equipped item has been moved to unequipped array
                var updatedInventory = {
                    equipped: this.props.inventory.equipped,
                    unequipped: this.props.inventory.unequipped
                };
                
                console.log('updatedInventory to be updated: ', JSON.stringify(updatedInventory));

                //TODO need to add functionality to remove effects from character's modified stats
                
                //Update the character's inventory on the server & locally
                this.updateProperty('inventory', updatedInventory)
                    .then( () => {
                        resolve();
                    });
            }
        })
    }

    /*
    resetHealth(){
        return new Promise((resolve, reject)=>{
            firebase.update(('character/' + characterID + '/actions/' + iterationIndex), singleActionUpdate)
                .then( updateResponse => {
                    console.log('Updated action: ', ('character/' + characterID + '/actions/' + iterationIndex));
                    console.log('updatedResponse: ', updateResponse);
                    iterationIndex++;
                    resolve();
                });
        })
    }*/
}


module.exports = {
    Character: Character
};

