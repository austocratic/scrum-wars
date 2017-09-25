/*"use strict";

var Firebase = require('../libraries/firebase').Firebase;
var Character = require('../models/Character').Character;
var Item = require('../models/Item').Item;

exports.equipmentMenu = async (userID) => {

    var firebase = new Firebase();

    var playerCharacter = new Character();

    playerCharacter.setByProperty('user_id', userID)
        .then( () => {

            //Base template to be added onto
            var baseSlackEquipmentTemplate = {
                "text": "Equipped Gear",
                "attachments": []
            };

            //Get an object of all equipment slots (there will never be many, so make one api call instead of individual calls)
            firebase.get('equipment_slot')
                .then( equipmentSlots =>{

                    //Iterate through the character's equipped items. (Array of item IDs)
                    var equippedInventoryPromises = playerCharacter.props.inventory.equipped.map( equipmentID =>{

                        return new Promise((resolve, reject)=>{

                            //Lookup that item's properties
                            var singleEquipment = new Item();

                            singleEquipment.setByID(equipmentID)
                                .then(()=>{

                                    return new Promise((resolve, reject)=>{

                                    //Iterate through that item's equipment_slots
                                    singleEquipment.props.equipment_slots.forEach( eachSlot =>{

                                        //Grab the title from the equipmentSlots object
                                        var equipmentSlotTitle = equipmentSlots[eachSlot].name;

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
                            
                            //console.log('baseSlackEquipmentTemplate: ', JSON.stringify(baseSlackEquipmentTemplate));
                            
                            resolve(baseSlackEquipmentTemplate)
                        })
                });
            });
};*/