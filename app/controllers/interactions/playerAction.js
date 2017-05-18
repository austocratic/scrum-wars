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

        var availableActions;

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

                                console.log('Character actions, character action: ', characterAction.action_id);

                                var actionTemplate;

                                return new Promise((resolve, reject) => {
                                    //lookup that action Id's zones that can be performed in
                                    firebase.get(('action/' + characterAction.action_id))
                                        .then(action => {

                                            console.log('action.zone_id: ', action.zone_id);

                                            console.log('characterZoneID: ', characterZoneID);

                                            //Check each action's zone_id to see if it matches the characters zone
                                            if (action.zone_id.indexOf(characterZoneID) > -1) {

                                                console.log('Matching actions attributes: ', action);

                                                //TODO attachment array will
                                                //If array is empty, build an attachment with the action
                                                if (template.attachments.length === 0) {

                                                    console.log('passed template.attachments.length === 0 check');

                                                    //Push action into an array of its own
                                                    var subArray = [];

                                                    var attachmentFormat = {
                                                        "title": action.type,
                                                        "fallback": "You are unable to choose an action",
                                                        "callback_id": "actionMenu",
                                                        "color": "#3AA3E3", //TODO change to attack oriented color
                                                        "attachment_type": "default",
                                                        //TODO add tiny_url for attack symbol
                                                        "actions": [
                                                            {
                                                                "name": action.name,
                                                                "text": action.name,
                                                                "style": "default",
                                                                "type": "button",
                                                                "value": characterAction.action_id //TODO is this the right property?
                                                            }]
                                                    };

                                                    template.attachments.push(attachmentFormat);

                                                    console.log("empty root array: ", JSON.stringify(template));


                                                } else {

                                                    console.log('failed template.length === 0 check, beginning to itterate');

                                                    console.log('template.attachments.length: ', template.attachments.length);

                                                    //template.attachments.length
                                                    for (var i = 0; i < 1; i++) {

                                                        console.log('action array: ', JSON.stringify(template.attachments[i].actions));

                                                        console.log(i + ' action.type: ', action.type);

                                                        //For each attachment, need to check to see if action property exists
                                                        if (template.attachments[i].actions) {
                                                            //If property does exists, but is not an array, overwrite it as an empty array
                                                            if (!Array.isArray(template.attachments[i].actions)) {
                                                                console.log('actions is not an array, setting as array');
                                                                template.attachments[i].actions = []
                                                            }
                                                        }
                                                        //If attachment property does not exist, add as empty array
                                                        else {
                                                            console.log('actions property does not exist, setting as array');
                                                            template.attachments[i].actions = [];
                                                        }

                                                        if (template.attachments[i].name === action.type) {
                                                            console.log('Found a match, pushing');

                                                            actionTemplate = {
                                                                "name": action.name,
                                                                "text": action.name,
                                                                "style": "default",
                                                                "type": "button",
                                                                "value": characterAction.action_id
                                                            };

                                                            template.attachments[i].push(actionTemplate);
                                                            //return i;
                                                            console.log("match itteration: ", JSON.stringify(template));

                                                            break;
                                                        }
                                                        //If no match was found, on last itteration push into array
                                                        else if (i === (template.attachments.length - 1)) {
                                                            console.log('Did not find a match, pushing to root');

                                                            actionTemplate = {
                                                                "title": action.type,
                                                                "fallback": "You are unable to choose an action",
                                                                "callback_id": "actionMenu",
                                                                "color": "#3AA3E3",
                                                                "attachment_type": "default",
                                                                "actions": [{
                                                                    "name": action.name,
                                                                    "text": action.name,
                                                                    "style": "default",
                                                                    "type": "button",
                                                                    "value": characterAction.action_id
                                                                }]
                                                            };

                                                            template.attachments.push(actionTemplate);
                                                            console.log("not match itteration: ", JSON.stringify(template));
                                                        }
                                                    }
                                                }
                                            }

                                            console.log('playerAction, resolving the template: ', JSON.stringify(template));

                                            resolve(template);

                                        });
                                });
                            });

                            Promise.all(actionPromises)
                                .then(finalTemplate => {

                                    console.log('FInal promise.all resolved');

                                    //finalTemplate[0].text = 'Choose an action';

                                    //console.log('Final template resolved: ', JSON.stringify(finalTemplate));

                                    template.text = 'Choose an action';

                                    console.log('Final template resolved: ', JSON.stringify(template));

                                    resolve(template);
                                    //resolve(finalTemplate);
                                })
                                .catch((err)=> {
                                    console.log('Error when trying to resolve all promises: ', err);
                                })
                        });
                }
            });
    });
};
