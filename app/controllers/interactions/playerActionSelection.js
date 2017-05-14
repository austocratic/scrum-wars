"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var attackCharacterSelection = require('../../slackTemplates/attackCharacterSelection').attackCharacterSelection;
var defendCharacterSelection = require('../../slackTemplates/defendCharacterSelection').defendCharacterSelection;
var shopCharacterSelection = require('../../slackTemplates/shopCharacterSelection').shopCharacterSelection;

exports.playerActionSelection = payload => {

    console.log('playerActionSelection: ', JSON.stringify(payload));

    return new Promise((resolve, reject) => {

        var firebase = new Firebase();
        
        var responseTemplate, userID;

        //Get the slack user ID who called the action
        userID = payload.user.id;

        firebase.get('character', 'user_id', userID)
            .then( characterResponse => {

                //Character's ID
                var characterID = Object.keys(characterResponse)[0];

                var playerCharacter = characterResponse[characterID];

                //TODO likely need to add get current user zone here to compare it to actual zone the command was called in

                switch(payload.actions[0].value) {

                    case 'Attack':

                        //Return the default template
                        responseTemplate = attackCharacterSelection();

                        //Get an array of all players in that zone
                        firebase.get('character', 'zone_id', playerCharacter.zone_id)
                            .then(charactersInZone => {

                                //Get an array of all character IDs in the zone
                                var charactersInZoneIDs = Object.keys(charactersInZone);

                                //Get the array position of the player's character:
                                var playerCharacterArrayPosition = charactersInZoneIDs.indexOf(characterID);

                                if (playerCharacterArrayPosition > -1) {
                                    charactersInZoneIDs.splice(playerCharacterArrayPosition, 1);
                                }

                                var namesInZone = charactersInZoneIDs.map( charID =>{
                                    return charactersInZone[charID].name;
                                });

                                var playerTemplate = namesInZone.map( playerName =>{

                                    return {
                                        "name": "playerName",
                                        "text": playerName,
                                        "style": "default",
                                        "type": "button",
                                        "value": playerName
                                    }
                                });

                                responseTemplate.attachments[0].actions = playerTemplate;

                                resolve(responseTemplate);

                            });

                        break;

                    case 'Defend':

                        //Return the default template
                        responseTemplate = defendCharacterSelection();

                        //Get the slack user ID who called the action
                        userID = payload.user.id;

                        //Get your character
                        firebase.get('character', 'user_id', userID)
                            .then( character => {

                                //Character's ID
                                var characterID = Object.keys(character)[0];

                                var updates = {
                                    "is_defending": true
                                };

                                //Create a table reference to be used for locating the character
                                var tableRef = 'character/' + characterID;

                                //Set your is_defending property
                                firebase.update(tableRef, updates)
                                    .then( ()=> {
                                        //Then return the new template
                                        resolve(responseTemplate)
                                    })
                            });

                        break;

                    case 'shop':

                        //Return the default template
                        responseTemplate = shopCharacterSelection();

                        //Get the merchant in the player's zone
                        firebase.get('merchant', 'zone_id', playerCharacter.zone_id)
                            .then(merchantsInZone => {

                                //Get the ID of the first merchant (should only be one per zone)
                                var merchantsInZoneID = Object.keys(merchantsInZone)[0];

                                //Get merchants profile
                                var activeMerchant = merchantsInZone[merchantsInZoneID];

                                //Iterate over active merchant's for_sale array and lookup the names return as an array
                                //Return an array of objects in the format for Slack
                                var itemNamePromises = activeMerchant.for_sale.map( itemID =>{

                                    return new Promise((resolve, reject)=>{
                                        firebase.get('item/' + itemID)
                                            .then(itemProfile => {
                                                resolve({
                                                    "text": itemProfile.name,
                                                    "value": itemID
                                                })
                                        })
                                    })
                                });
                                
                                Promise.all(itemNamePromises)
                                    .then( itemSlackFormat =>{

                                        responseTemplate.attachments[0].actions[0].options = itemSlackFormat;

                                        resolve(responseTemplate);
                                    });
                            });

                        break;

                    default:

                        resolve(
                            {
                                "text": "That action is not supported"
                            }
                        );


        }
        });
    });
};