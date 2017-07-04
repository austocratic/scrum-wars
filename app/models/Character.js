'use strict';

//var Firebase = require('../libraries/firebase').Firebase;
//var FirebaseBaseController = require('./FirebaseBaseController').FirebaseBaseController;
//var Slack = require('../libraries/slack').Alert;
//var Item = require('./Item').Item;
//var firebase = new Firebase();

var BaseModel = require('./BaseModel').BaseModel;
var slackTemplates = require('../slackTemplates');


class Character extends BaseModel{
    constructor(gameState, characterID){
        super();
        
        var characters = gameState.character;
        
        //Set the character's props
        this.props = characters[characterID];
        this.id = characterID
        
    }

    purchaseItem(itemObject){

        //Check if the player has sufficient gold
        if (this.props.gold < itemObject.props.cost) {
            //If insufficient gold: return template
            var responseTemplate = slackTemplates.insufficientFunds;

            responseTemplate.text = "I'm sorry traveler, you don't have " + itemObject.props.cost + " gold." +
                "\nCan I interest you in something else?";
        }

        //If sufficient gold:
        //Add item ID to player's inventory
        //Update the characters name property locally
        this.updateProperty('name', 'testedNewName');

        //Reduce character's gold by item cost
        //Return purchase confirmation template

    }


 
    
}





//OLD VERSION
/*
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


    //Creating new version 6/18/17 - this version is does not write to DB.  It will rely on updating the Character object locally before
    //a single UPDATE refreshes the entire object's state on the DB
    equipItem(equippedItem){

        console.log('called equipItem');

        return new Promise((resolve, reject)=>{

            var modifiedEquippedItems = [];
            var equippedItems = [];

            //Iterate through the character's equipped items. (Array of item IDs)
            var equippedInventoryPromises = this.props.inventory.equipped.map( equipmentID => {

                return new Promise((resolve, reject)=> {

                    //Lookup each item's properties
                    var singleEquipment = new Item();
                    singleEquipment.setByID(equipmentID)
                        .then(()=> {

                            //Build an array of item objects
                            equippedItems.push(singleEquipment);

                            //Iterate over that item's equipment_slots property adding to equippedSlots
                            singleEquipment.props.equipment_slots.forEach( equippedItemSlotID => {

                                //console.log('equippedItemSlotID: ', equippedItemSlotID);

                                modifiedEquippedItems.push({
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
                    modifiedEquippedItems.forEach( eachItem =>{

                        //Push item Ids to itemIDsToUnequip if they match the slot of an item attempting to equip
                        equippedItem.props.equipment_slots.forEach( slotID =>{

                            if (slotID == eachItem.slot_id && itemIDsToUnequip.indexOf(eachItem.item_id) === -1) {
                                itemIDsToUnequip.push(eachItem.item_id)
                            }
                        });
                    });

                    //Now that we have an array of item IDs that need to be unequipped, iterate through them unequipping them
                    var itemIDsToUnequipPromises = itemIDsToUnequip.map( itemIDtoUnequip =>{
                        return new Promise((resolve, reject)=>{

                            //equippedItems array contains item objects.  Each item object has a .props.id property.  Need to find the object who's id property matches itemIDtoUnequip
                            //TODO replace with a function that can find the sup property .props.id
                            equippedItems.find()

                            //Pass the whole item object into the unequip function
                            this.unequipItem(this.props.inventory.equipped[itemIDtoUnequip])
                                .then(()=>{
                                    resolve()
                                });
                        })
                    });*/
                    /*
                     function serialAsyncMap(collection, fn) {

                     let results = [];
                     let promise = Promise.resolve();

                     for (let item of collection) {
                     promise = promise.then(() => fn(item))
                     .then(result => {
                     results.push(result)
                     });
                     }
                     return promise.then(() => {
                     return results
                     });
                     }

                     serialAsyncMap(itemIDsToUnequip, this.unequipItem.bind(this));*/

                    /*
                    //Wait until all equipment in inventory slots has been unequipped
                    //Then add the originally equipped item
                    Promise.all(itemIDsToUnequipPromises)
                        .then(()=>{

                            this.props.inventory.equipped.push(equippedItem.props.id);

                            //Remove the unequipped item from unequipped
                            this.props.inventory.unequipped.splice(this.props.inventory.unequipped.indexOf(equippedItem.props.id), 1);

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
                        })
                });*/

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

      //  })
    //}

    /*
    equipItem(equippedItem){

        console.log('called equipItem');

        return new Promise((resolve, reject)=>{

            var modifiedEquippedItems = [];
            var equippedItems = [];

                //Iterate through the character's equipped items. (Array of item IDs)
                var equippedInventoryPromises = this.props.inventory.equipped.map( equipmentID => {

                    return new Promise((resolve, reject)=> {

                        //Lookup each item's properties
                        var singleEquipment = new Item();
                        singleEquipment.setByID(equipmentID)
                            .then(()=> {

                                //Build an array of item objects
                                equippedItems.push(singleEquipment);

                                //Iterate over that item's equipment_slots property adding to equippedSlots
                                singleEquipment.props.equipment_slots.forEach( equippedItemSlotID => {

                                    //console.log('equippedItemSlotID: ', equippedItemSlotID);

                                    modifiedEquippedItems.push({
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
                        modifiedEquippedItems.forEach( eachItem =>{

                            //Push item Ids to itemIDsToUnequip if they match the slot of an item attempting to equip
                            equippedItem.props.equipment_slots.forEach( slotID =>{

                                if (slotID == eachItem.slot_id && itemIDsToUnequip.indexOf(eachItem.item_id) === -1) {
                                    itemIDsToUnequip.push(eachItem.item_id)
                                }
                            });
                        });

                        //Now that we have an array of item IDs that need to be unequipped, iterate through them unequipping them
                        var itemIDsToUnequipPromises = itemIDsToUnequip.map( itemIDtoUnequip =>{
                            return new Promise((resolve, reject)=>{

                                //equippedItems array contains item objects.  Each item object has a .props.id property.  Need to find the object who's id property matches itemIDtoUnequip
                                //TODO replace with a function that can find the sup property .props.id
                                equippedItems.find()

                                //Pass the whole item object into the unequip function
                                this.unequipItem(this.props.inventory.equipped[itemIDtoUnequip])
                                    .then(()=>{
                                        resolve()
                                    });
                            })
                        });
/*
                        function serialAsyncMap(collection, fn) {

                            let results = [];
                            let promise = Promise.resolve();

                            for (let item of collection) {
                                promise = promise.then(() => fn(item))
                                    .then(result => {
                                        results.push(result)
                                    });
                            }
                            return promise.then(() => {
                                return results
                            });
                        }

                        serialAsyncMap(itemIDsToUnequip, this.unequipItem.bind(this));*/
                        /*

                        //Wait until all equipment in inventory slots has been unequipped
                        //Then add the originally equipped item
                        Promise.all(itemIDsToUnequipPromises)
                            .then(()=>{

                                this.props.inventory.equipped.push(equippedItem.props.id);

                                //Remove the unequipped item from unequipped
                                this.props.inventory.unequipped.splice(this.props.inventory.unequipped.indexOf(equippedItem.props.id), 1);

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
                            })
                    });*/
            
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
            
    //    })
    //}

    //Argument passed is an item ID that should be currently equipped.
    //1.) Check that item ID passed is actually equipped
    //2.) Remove from equipped array & add to unequipped array in one DB call
    /*
    unequipItem(itemIDtoUnequip){

        return new Promise((resolve, reject)=>{

            //Verify that the item ID passed in is in the equipped array
            if (this.props.inventory.equipped.indexOf(itemIDtoUnequip) === -1) {
                reject('ERROR - itemID is not equipped by this character')
            } else {

                //Remove the item from local equipped array
                this.props.inventory.equipped.splice(this.props.inventory.equipped.indexOf(itemIDtoUnequip), 1);

                //Add the unequipped item to the local unequipped array
                this.props.inventory.unequipped.push(itemIDtoUnequip);

                //Build a new inventory object where equipped item has been moved to unequipped array
                var updatedInventory = {
                    equipped: this.props.inventory.equipped,
                    unequipped: this.props.inventory.unequipped
                };

                //TODO need to add functionality to remove effects from character's modified stats
                
                //Update the character's inventory on the server & locally
                this.updateProperty('inventory', updatedInventory)
                    .then( () => {
                        resolve();
                    });
            }
        })
    }

    //I should have a refresh function insted of individual references to this.updateProperty.

    //This way I make all the updated locally, then call this.refresh to push all of the corresponding changes to the server
    //This will prevent many frequent server calls and keep everything syncronous until one final async call


    async incrementLocalProperty(propertyReference, value){

        this.props[propertyReference] = this.props[propertyReference] + value;


        //Update the character's inventory on the server & locally
        this.updateProperty('inventory', updatedInventory)
            .then( () => {

            });
    }

    
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
    }
}*/


module.exports = {
    Character: Character
};

