"use strict";

var Firebase = require('../libraries/firebase').Firebase;
//var characterProfile = require('../../slackTemplates/characterProfile').characterProfile;

exports.equipmentMenu = payload => {

    var firebase = new Firebase();

    return new Promise((resolve, reject) => {

        console.log('inventoryMenu payload: ', JSON.stringify(payload));

        //Get the slack user ID who made the selection
        //var userID = payload.user_id;
        var userID = payload.user.id;

        //Use Slack user ID to lookup the user's character
        firebase.get('character', 'user_id', userID)
            .then(character => {

                console.log('character inventoryMenu:', character);

                //Character's ID
                var characterID = Object.keys(character)[0];

                //Set the player's character locally
                var playerCharacter = character[characterID];

                //Get the character's unequipped inventory
                var equippedInventory = playerCharacter.inventory.equipped;

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
                                    ]
                                },
                                {
                                    "title": "Secondary hand",
                                    "callback_id": "equipmentMenu",
                                    "fields": []
                                }
                            ]
                        };

                        resolve(slackTemplate);
                        
                    });

                

                /*
                Promise.all(unequippedInventoryOptions)
                    .then( itemSlackFormat =>{

                        slackTemplate.attachments[0].actions[0].options = itemSlackFormat;

                        resolve(slackTemplate);

                        console.log('slackTemplate inventoryMenu: ', slackTemplate);

                    });*/
            });
    });
};