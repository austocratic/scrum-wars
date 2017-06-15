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

                            console.log('resetting actions for character ID: ', this.props.id);
                            
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

                                    console.log('equippedItemSlotID: ', equippedItemSlotID);

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

                        console.log('equippedItems array of objects: ', JSON.stringify(equippedItems));
                        //Now I have an array of objects

                        var itemIDsToUnequip = [];

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

                                        itemIDsToUnequip.push(eachItem.item_id);
                                        
                                        //Now that we have an array of item IDs that need to be unequipped, Iterate through them unequipping them.
                                        //This will update the server and .this character object
                                        this.unequipItem(eachItem.item_id)
                                            .then(()=>{
                                                resolve()
                                            });
                                    } else {
                                        resolve()

                                    }
                                })
                            })
                        });

                        /*
                        //Wait until all equipment in inventory slots has been unequipped
                        Promise.all(unequippedInventoryPromises)
                            .then(()=>{

                                //Create a local array for mutation
                                var updatedEquipped = this.props.inventory.equipped;

                                //Add the unequipped item
                                updatedEquipped.push(equippedItem);

                                var updatedUnequipped = this.props.inventory.unequipped;
                                
                                //Build a new inventory object where equipped item has been moved to unequipped array
                                var updatedInventory = {
                                    equipped: updatedEquipped,
                                    unequipped: updatedUnequipped
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

        console.log('called unequipItem');

        return new Promise((resolve, reject)=>{

            //Verify that the item ID passed in is in the equipped array
            if (this.props.inventory.equipped.indexOf(itemToUnequip) === -1) {
                reject('ERROR - itemID is not equipped by this character')
            } else {

                console.log('Unequipping, current inventory: ', JSON.stringify(this.props.inventory.equipped));

                //Create a local array for mutation
                //var updatedEquipped = this.props.inventory.equipped;

                console.log('array element to splice: ', this.props.inventory.equipped.indexOf(itemToUnequip));

                //Remove the element passed as argument
                this.props.inventory.equipped.splice(this.props.inventory.equipped.indexOf(itemToUnequip), 1);

                console.log('Updated equipped after splice: ', JSON.stringify(this.props.inventory.equipped));

                //Create a local array for mutation
                //var updatedUnequipped = this.props.inventory.unequipped;

                //Add the unequipped item
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

