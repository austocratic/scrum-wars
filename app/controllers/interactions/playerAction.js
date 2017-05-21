"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var actionMenu = require('../../slackTemplates/actionMenu').actionMenu;
var moveCharacter = require('../../components/zone/moveCharacter').moveCharacter;

var firebase = new Firebase();

exports.playerAction = payload => {

    console.log('playerAction payload: ', payload);

    return new Promise((resolve, reject) => {

        //Get the channel id
        var channelID = payload.channel_id;

        var userID = payload.user_id;

        var template = actionMenu();

        //Lookup the details of the channelID that the action was called in
        var zonePromise = firebase.get('zone', 'channel_id', channelID);

        //Lookup the details of the character
        var characterPromise = firebase.get('character', 'user_id', userID);

        Promise.all([zonePromise, characterPromise])
            .then(resultsArray => {

            var zoneCalled = resultsArray[0];
            var zoneID = Object.keys(zoneCalled)[0];
            var zoneCalledDetails = zoneCalled[zoneID];

            var playerCharacter = resultsArray[1];
            var playerCharacterID = Object.keys(playerCharacter)[0];
            var playerCharacterDetails = playerCharacter[playerCharacterID];

            //Check if the zone ID where the command was called matches the zone ID of the user's character.  If mismatch, resolve with "move your character" option
            if (zoneID !== playerCharacterDetails.zone_id) {

                var moveCharacterTemplate = moveCharacter(zoneID, zoneCalledDetails.name);

                resolve(moveCharacterTemplate);

            } else {

                //TODO to delete the get character call here, duplicate from above
                //Get the user's character
                firebase.get('character', 'user_id', userID)
                    .then(userCharacter => {

                        var characterID = Object.keys(userCharacter)[0];

                        var characterProperties = userCharacter[characterID];

                        var characterZoneID = characterProperties.zone_id;

                        //Array of character action objects
                        var characterActions = characterProperties.actions;

                        var template = {
                            "attachments": []
                        };

                        //For each action the character can perform
                        var actionPromises = characterActions.map(characterAction => {

                            //console.log('Character actions, character action: ', characterAction.action_id);

                            var actionTemplate;

                            return new Promise((resolve, reject) => {
                                //lookup that action Id's zones that can be performed in
                                firebase.get(('action/' + characterAction.action_id))
                                    .then(action => {

                                        action.action_id = characterAction.action_id;

                                        //Resolve the action object
                                        resolve(action);

                                    });
                            });
                        });

                        //Wait for all action lookups to resolve, array of action objects
                        Promise.all(actionPromises)
                            .then(actionObjects => {

                                //Filter action object array for only actions that can be used in player's zone
                                var availableActions = actionObjects.filter(singleAction => {

                                    //Zone_id is an array of zones that the action can be performed in.  Check if the character's
                                    //current zone is contained in the array
                                    return singleAction.zone_id.indexOf(characterZoneID) > -1

                                });

                                //console.log('Actions available after filter: ', JSON.stringify(availableActions));

                                //Now iterate through the available action object array and build the template
                                availableActions.forEach(eachAction => {

                                    var attachmentLength = template.attachments.length;

                                        //console.log('attachmentLength: ', attachmentLength);

                                        var actionTemplate;

                                        //First check if attachments property is empty
                                        if (attachmentLength === 0) {

                                            var attachmentFormat = {
                                                "title": eachAction.type,
                                                "fallback": "You are unable to choose an action",
                                                "callback_id": "actionMenu",
                                                "color": "#3AA3E3", //TODO change to attack oriented color
                                                "attachment_type": "default",
                                                //TODO add tiny_url for attack symbol
                                                "actions": [
                                                    {
                                                        "name": eachAction.name,
                                                        "text": eachAction.name,
                                                        "style": "default",
                                                        "type": "button",
                                                        "value": eachAction.action_id
                                                    }]
                                            };

                                            //console.log('Character actions, character action: ', eachAction.action_id);
                                            template.attachments.push(attachmentFormat);

                                            console.log("empty root array: ", JSON.stringify(template));

                                            //Of attachments is not empty, iterate through it for sorting
                                        } else {

                                            //Iterate through the template's attachments
                                            for (var i = 0; i < attachmentLength; i++) {

                                            //For each attachment, need to check to see if action property exists
                                            if (template.attachments[i].actions) {
                                                //If property does exists, but is not an array, overwrite it as an empty array
                                                if (!Array.isArray(template.attachments[i].actions)) {
                                                    //console.log('actions is not an array, setting as array');
                                                    template.attachments[i].actions = []
                                                }
                                            }
                                            //If attachment property does not exist, add as empty array
                                            else {
                                                //console.log('actions property does not exist, setting as array');
                                                template.attachments[i].actions = [];
                                            }

                                            //If there is a match, push to that array
                                            if (template.attachments[i].title === eachAction.type) {
                                                //console.log('Found a match, pushing');

                                                actionTemplate = {
                                                    "name": eachAction.name,
                                                    "text": eachAction.name,
                                                    "style": "default",
                                                    "type": "button",
                                                    "value": eachAction.action_id
                                                };

                                                //console.log('Character actions, character action: ', eachAction.action_id);
                                                template.attachments[i].actions.push(actionTemplate);
                                                //return i;
                                                console.log("FOUND a match iteration: ", JSON.stringify(template));

                                                break;
                                            }
                                            //If no match was found, on last iteration push into root array
                                            else if (i === (attachmentLength - 1)) {
                                                //console.log('Did not find a match, pushing to root, attachmentLength: ', attachmentLength);

                                                actionTemplate = {
                                                    "title": eachAction.type,
                                                    "fallback": "You are unable to choose an action",
                                                    "callback_id": "actionMenu",
                                                    "color": "#3AA3E3",
                                                    "attachment_type": "default",
                                                    "actions": [{
                                                        "name": eachAction.name,
                                                        "text": eachAction.name,
                                                        "style": "default",
                                                        "type": "button",
                                                        "value": eachAction.action_id
                                                    }]
                                                };

                                                //console.log('Character actions, character action: ', eachAction.action_id);
                                                template.attachments.push(actionTemplate);
                                                console.log("NO match iteration: ", JSON.stringify(template));

                                            }
                                        }
                                    }
                                });
                                console.log('Final template to be resolved: ', JSON.stringify(template));

                                resolve(template);

                            })
                            .catch((err)=> {
                                console.log('Error when trying to resolve all promises: ', err);
                            });

                    });
                }
            });
    });
};
