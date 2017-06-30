"use strict";

var Firebase = require('../libraries/firebase').Firebase;
//var characterProfile = require('../../slackTemplates/characterProfile').characterProfile;

exports.inventoryMenu = async (userID) => {

    var firebase = new Firebase();

    //Use Slack user ID to lookup the user's character
    firebase.get('character', 'user_id', userID)
        .then(character => {

            //console.log('character inventoryMenu:', character);

            //Character's ID
            var characterID = Object.keys(character)[0];

            //Set the player's character locally
            var playerCharacter = character[characterID];

            //Get the character's unequipped inventory
            var unequippedInventory = playerCharacter.inventory.unequipped;

            //For each item in unequipped inventory, look up it's name and add to options list
            var unequippedInventoryOptions = unequippedInventory.map(singleUnequippedItemID => {

                //Get the item's name property
                return new Promise((resolve, reject)=> {
                    firebase.get('item/' + singleUnequippedItemID)
                        .then(singleUnequippedItem => {

                            //console.log('singleUnequippedItem: ', JSON.stringify(singleUnequippedItem));

                            resolve({
                                "text": singleUnequippedItem.name,
                                "value": singleUnequippedItemID
                            })
                        });
                });
            });

            var slackTemplate = {

                "attachments": [
                    {
                        "text": "Unequipped Inventory",
                        "callback_id": "inventoryMenu",
                        "actions": [
                            {
                                "name": "unequippedInventory",
                                "type": "select",
                                "options": []
                            }]
                    }]
            };

            Promise.all(unequippedInventoryOptions)
                .then( itemSlackFormat =>{

                    slackTemplate.attachments[0].actions[0].options = itemSlackFormat;

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

                    slackTemplate.attachments.push(backButton);

                    resolve(slackTemplate);

                    //console.log('slackTemplate inventoryMenu: ', JSON.stringify(slackTemplate));

                });
        });
};