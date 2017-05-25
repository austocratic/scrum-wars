"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var attackCharacterSelection = require('../../slackTemplates/attackCharacterSelection').attackCharacterSelection;
var actionUnavailable = require('../../slackTemplates/actionUnavailable').actionUnavailable;
var defendCharacterSelection = require('../../slackTemplates/defendCharacterSelection').defendCharacterSelection;
var shopCharacterSelection = require('../../slackTemplates/shopCharacterSelection').shopCharacterSelection;

exports.playerActionSelection = payload => {

    console.log('playerActionSelection: ', JSON.stringify(payload));

    var firebase = new Firebase();

    var responseTemplate, userID;

    //Get the slack user ID who called the action
    userID = payload.user.id;

    //Determine if any actions are available this turn
    function areActionsAvailable(character, match){

        console.log('character in areActionsAvailable: ', JSON.stringify(character));

        //Determine if the character used an action on the current turn
        if (match.number_turns > character.turn_action_used) {
            return true
        } else {
            return false
        }
    }

    function isActionAvailable(charID, character, actionID, action, match){

        console.log('charID: ', charID);
        console.log('character: ', character);
        console.log('actionID: ', actionID);
        console.log('action: ', action);

        var characterAction = character.actions.find( singleAction =>{
           return singleAction.action_id === actionID
        });

        console.log('characterAction: ', characterAction);

        if (characterAction.turn_used + action.cool_down <= match.number_turns) {
            return true
        } else {
            return false
        }
    }
    
    return new Promise((resolve, reject) => {

        firebase.get('character', 'user_id', userID)
            .then( characterResponse => {

                //Character's ID
                var characterID = Object.keys(characterResponse)[0];

                var characterDetails = characterResponse[characterID];

                //Get the details about the action called
                firebase.get('action/' + payload.actions[0].value)
                    .then(actionDetails => {

                        //console.log('actionResponse: ', JSON.stringify(actionResponse));

                        //var actionDetails = actionResponse[payload.actions[0].value];

                        //Lookup the current match ID
                        firebase.get('global_state/match_id')
                            .then(matchID => {

                                //Get the details of that match
                                firebase.get('match/' + matchID)
                                    .then(matchDetails => {

                                        initiateAction(characterID, characterDetails, matchDetails, actionDetails)
                                            .then( responseTemplate =>{
                                                resolve(responseTemplate)
                                            })

                                    });
                            });
                    });
            });
    });

        function initiateAction(characterID, characterDetails, matchDetails, actionDetails){

            return new Promise((resolve, reject) =>{

                switch (payload.actions[0].value) {

                    //TODO: currently hard coding action ID, need to make these dynamic
                    //Attack action
                    case '-Kjpe29q_fDkJG-73AQO':

                            //If actions are available build the attack template, otherwise build the unavailable template
                            if (areActionsAvailable(characterDetails, matchDetails)) {

                                if (isActionAvailable(characterID, characterDetails, payload.actions[0].value, actionDetails, matchDetails)) {

                                    //Return the default template
                                    responseTemplate = attackCharacterSelection();

                                    //Get an array of all players in that zone
                                    firebase.get('character', 'zone_id', characterDetails.zone_id)
                                        .then(charactersInZone => {

                                            //Get an array of all character IDs in the zone
                                            var charactersInZoneIDs = Object.keys(charactersInZone);

                                            //Get the array position of the player's character:
                                            var playerCharacterArrayPosition = charactersInZoneIDs.indexOf(characterID);

                                            if (playerCharacterArrayPosition > -1) {
                                                charactersInZoneIDs.splice(playerCharacterArrayPosition, 1);
                                            }

                                            var namesInZone = charactersInZoneIDs.map(charID => {
                                                return charactersInZone[charID].name;
                                            });

                                            var playerTemplate = namesInZone.map(playerName => {

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
                                } else {
                                    //TODO add response here
                                }
                            } else {
                                responseTemplate = actionUnavailable();

                                resolve(responseTemplate);
                            }

                        break;

                    //TODO: currently hard coding action ID, need to make these dynamic
                    //Defend action
                    case '-KjpeJT7Oct3ZCtLhENO':

                        //Return the default template
                        responseTemplate = defendCharacterSelection();

                        //Get the slack user ID who called the action
                        userID = payload.user.id;

                        //Get your character
                        //firebase.get('character', 'user_id', userID)
                        //.then( character => {

                        //Character's ID
                        //var characterID = Object.keys(characterDetails)[0];

                        var updates = {
                            "is_defending": true
                        };

                        //Create a table reference to be used for locating the character
                        var tableRef = 'character/' + characterID;

                        //Set your is_defending property
                        firebase.update(tableRef, updates)
                            .then(()=> {
                                //Then return the new template
                                resolve(responseTemplate)
                            });
                        //});

                        break;

                    //Shop action ID
                    case '-KkJVqtBIhpAKBfz9tcb':

                        //Return the default template
                        responseTemplate = shopCharacterSelection();

                        //Get the merchant in the player's zone
                        firebase.get('merchant', 'zone_id', characterDetails.zone_id)
                            .then(merchantsInZone => {

                                //Get the ID of the first merchant (should only be one per zone)
                                var merchantsInZoneID = Object.keys(merchantsInZone)[0];

                                //Get merchants profile
                                var activeMerchant = merchantsInZone[merchantsInZoneID];

                                //Iterate over active merchant's for_sale array and lookup the names return as an array
                                //Return an array of objects in the format for Slack
                                var itemNamePromises = activeMerchant.for_sale.map(itemID => {

                                    return new Promise((resolve, reject)=> {
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
                                    .then(itemSlackFormat => {

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
            })
    }
};