"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
//var characterProfile = require('../../slackTemplates/characterProfile').characterProfile;

exports.inventoryMenu = payload => {

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
                var unequippedInventory = playerCharacter.inventory.unequipped;

                //For each item in unequipped inventory, look up it's name and add to options list
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

                        resolve(slackTemplate);

                        console.log('slackTemplate inventoryMenu: ', slackTemplate);

                    });
            });
    });
};