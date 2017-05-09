"use strict";

var firebase = require('../../libraries/firebase').Firebase;
//var characterProfile = require('../../slackTemplates/characterProfile').characterProfile;

exports.inventoryMenu = payload => {

    try {

        return new Promise((resolve, reject) => {

            //Get the slack user ID who made the selection
            var userID = payload.user_id;

            //Use Slack user ID to lookup the user's character
            firebase.get('character', 'user_id', userID)
                .then(character => {

                    console.log('character inventoryMenu:', character);

                    //Character's ID
                    var characterID = Object.keys(character)[0];

                    //Set the player's character locally
                    var playerCharacter = character[characterID];

                    //Inventory menu is divided into 2 attachments: Equipped inventory & unequipped inventory

                    //Get the character's equipped inventory
                    var equippedInventory = playerCharacter.inventory.equipped;

                    //Get the character's unequipped inventory
                    var unequippedInventory = playerCharacter.inventory.unequipped;

                    //For each item in unequipped inventory, look up it's name and add to options list
                    var unequippedInventoryOptions = unequippedInventory.map(singleUnequippedItemID => {

                        //Get the item's name property
                        firebase.get('item/' + singleUnequippedItemID)
                            .then(singleUnequippedItem => {
                                return {
                                    "text": singleUnequippedItem.name,
                                    "value": singleUnequippedItemID
                                }
                            });
                    });

                    var slackTemplate = {

                        "attachment": [{
                            "text": "Equipped Inventory",
                            "callback_id": "game_selection",
                            "actions": [
                                {
                                    "name": "unequippedInventory",
                                    "type": "select",
                                    "options": []
                                }
                            ]
                        },
                            {
                                "text": "Unequipped Inventory"
                            }]
                    };

                    slackTemplate.attachment[0].actions[0].options = unequippedInventoryOptions;

                    resolve(slackTemplate);

                    console.log('slackTemplate inventoryMenu: ', slackTemplate);


                });
        });

    }catch(err){
        console.log('CAUGHT ERROR inventoryMenu: ', err)
    }
};