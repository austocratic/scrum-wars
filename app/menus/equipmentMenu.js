"use strict";

var Firebase = require('../libraries/firebase').Firebase;
var Character = require('../controllers/Character').Character;
var Item = require('../controllers/Item').Item;

exports.equipmentMenu = payload => {

    var firebase = new Firebase();

    return new Promise((resolve, reject) => {

        console.log('inventoryMenu payload: ', JSON.stringify(payload));

        //Get the slack user ID who made the selection
        //var userID = payload.user_id;
        var userID = payload.user.id;

        var playerCharacter = new Character();

        playerCharacter.setByProperty('user_id', userID)

        //Use Slack user ID to lookup the user's character
        //firebase.get('character', 'user_id', userID)
            .then( () => {
                
                //Character's ID
                //var characterID = Object.keys(character)[0];

                //Set the player's character locally
                //var playerCharacter = character[characterID];

                //Get the character's unequipped inventory
                //var equippedInventory = playerCharacter.props.inventory.equipped;

                //For each item in unequipped inventory, look up it's name and add to options list
                /*
                var unequippedInventoryOptions = unequippedInventory.map(singleUnequippedItemID => {

                    //Get the item's name property
                    return new Promise((resolve, reject)=> {
                        firebase.get('item/' + singleUnequippedItemID)
                            .then(singleUnequippedItem => {
                                resolve({
                                    "text": singleUnequippedItem.name,
                                    "value": singleUnequippedItemID
                                })
                            });
                    });
                });*/

                //Base template to be added onto
                var baseSlackEquipmentTemplate = {
                    "text": "Equipped Gear",
                    "attachments": []
                };

                //Get an object of all equipment slots (there will never be many, so make one api call instead of individual calls)
                firebase.get('equipment_slot')
                    .then( equipmentSlots =>{

                        console.log('Got equipment slots object: ', equipmentSlots);

                        console.log('Got equipment slots object - test: ', equipmentSlots['-KmTV24FelP7T8rdKLEx']);

                        //Iterate through the character's equipped items. (Array of item IDs)
                        var equippedInventoryPromises = playerCharacter.props.inventory.equipped.map( equipmentID =>{

                            return new Promise((resolve, reject)=>{

                                //Lookup that item's properties
                                var singleEquipment = new Item();

                                singleEquipment.setByID(equipmentID)
                                    .then(()=>{

                                        return new Promise((resolve, reject)=>{

                                        //Grab the title from the equipmentSlots object
                                        var equipmentSlotTitle = equipmentSlots[singleEquipment.props.id].name;
                                            
                                            console.log('equipmentSlotTitle: ', equipmentSlotTitle);

                                        //Iterate through each equipment's equipment slots.  Push each slot into the template
                                        baseSlackEquipmentTemplate.attachments.push({
                                            "title": equipmentSlotTitle,
                                            "callback_id": "equipmentMenu",
                                            "thumb_url": "https://scrum-wars.herokuapp.com/assets/thumb/" + singleEquipment.props.id + ".jpg",
                                            "fields": [
                                                {
                                                    "title": "Equipment name",
                                                    "value": singleEquipment.props.name,
                                                    "short": false
                                                }
                                            ],
                                            "actions": [{
                                                "name": "inspect",
                                                "text": "Inspect item",
                                                "style": "default",
                                                "type": "button",
                                                "value": singleEquipment.props.id
                                            }]
                                        });

                                        resolve();
                                    })
                                })
                                .then(()=>{
                                    resolve()
                                })
                            })
                        });
                        
                        
                        Promise.all(equippedInventoryPromises)
                            .then(()=>{
                                var backButton = {
                                    "fallback": "Unable to return to previous menu",
                                    "callback_id": "characterProfile",
                                    "actions": [{
                                        "name": "back",
                                        "text": "Back to profile",
                                        "style": "default",
                                        "type": "button",
                                        "value": "back"
                                    }]
                                };

                                baseSlackEquipmentTemplate.attachments.push(backButton);
                                
                                console.log('baseSlackEquipmentTemplate: ', JSON.stringify(baseSlackEquipmentTemplate));
                                
                                resolve(baseSlackEquipmentTemplate)
                            })
                        
                    });




                /*
                var singleHandID = equippedInventory.hand_1;

                firebase.get('item/' + singleHandID)
                    .then(handItem => {
                        
                        var slackTemplate = {

                            "text": "Equipped Gear",
                            "attachments": [
                                {
                                    "title": "Chest",
                                    "callback_id": "equipmentMenu",
                                    "fields": []
                                },
                                {
                                    "title": "Head",
                                    "callback_id": "equipmentMenu",
                                    "fields": []
                                },
                                {
                                    "title": "Arms",
                                    "callback_id": "equipmentMenu",
                                    "fields": []
                                },
                                {
                                    "title": "Legs",
                                    "callback_id": "equipmentMenu",
                                    "fields": []
                                },
                                {
                                    "title": "Feet",
                                    "callback_id": "equipmentMenu",
                                    "fields": []
                                },
                                {
                                    "title": "Primary hand",
                                    "callback_id": "equipmentMenu",
                                    "thumb_url": "https://scrum-wars.herokuapp.com/assets/thumb/" + singleHandID + ".jpg",
                                    "fields": [
                                        {
                                            "title": "Equipment name",
                                            "value": handItem.name,
                                            "short": false
                                        }
                                    ],
                                    "actions": [{
                                        "name": "inspect",
                                        "text": "Inspect item",
                                        "style": "default",
                                        "type": "button",
                                        "value": singleHandID
                                    }]
                                },
                                {
                                    "title": "Secondary hand",
                                    "callback_id": "equipmentMenu",
                                    "fields": []
                                }
                            ]
                        };
                        
               

                        console.log('equipment slack template: ', JSON.stringify(slackTemplate));
                        
                        resolve(slackTemplate);
                        */
                        
                    });

                

                /*
                Promise.all(unequippedInventoryOptions)
                    .then( itemSlackFormat =>{

                        slackTemplate.attachments[0].actions[0].options = itemSlackFormat;

                        resolve(slackTemplate);

                        console.log('slackTemplate inventoryMenu: ', slackTemplate);

                    });*/
            });
};