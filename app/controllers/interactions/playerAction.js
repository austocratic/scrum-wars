"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var actionMenu = require('../../slackTemplates/actionMenu').actionMenu;

var firebase = new Firebase();

exports.playerAction = payload => {

    return new Promise( (resolve, reject) => {

        //Get the channel id
        var channelID = payload.channel_id;

        var availableActions;

        var template = actionMenu();

        console.log('Channel ID: ', channelID);

        //Set the availableActions property depending on the zone
        //TODO Should not hard code this.  Should use DB values here
        switch(channelID) {

            //Zone = town
            case 'C4Z4P1BUH':

                //Set the available actions
                template.attachments[0].actions = [
                        {
                            "name": "shop",
                            "text": "Shop",
                            "style": "default",
                            "type": "button",
                            "value": "shop"
                        }
                    ];
                
                break;

            //Zone = arena
            case 'C4Z7F8XMW':

                console.log('Triggered arena zone action');
                /*
                //Get the slack user ID who called the action
                var userID = payload.user_id;

                //Lookup the zone's ID
                var get1 = firebase.get('zone', 'channel_id', channelID);

                //Get your character
                var get2 = firebase.get('character', 'user_id', userID)    ;

                //Wait for both above promises to resolve
                Promise.all([get1, get2])
                    .then( props => {

                        var zoneID = Object.keys(props[0])[0];
                        var characterID = Object.keys(props[1])[0];

                        var characterZone = props[0][zoneID];
                        var characterProperties = props[1][characterID];

                        //Array of objects
                        var characterActions = characterProperties.actions;

                        var zoneActions = characterZone.action_id;

                        var availableActionIDs = characterActions.filter( characterAction =>{

                            return zoneActions.indexOf(characterAction.action_id) > -1;
                        });

                        console.log('availableActions: ', JSON.stringify(availableActionIDs));
*/


                        //Get the slack user ID who called the action
                        var userID = payload.user_id;

                        //Get the user's character
                        firebase.get('character', 'user_id', userID)
                            .then( userCharacter =>{

                                var characterID = Object.keys(userCharacter)[0];

                                var characterProperties = userCharacter[characterID];

                                var characterZoneID = characterProperties.zone_id;

                                //Array of character action objects
                                var characterActions = characterProperties.actions;

                                var attachments = [{
                                    "title": "Offensive actions",
                                    "fallback": "You are unable to choose an action",
                                    "callback_id": "actionMenu",
                                    "color": "#3AA3E3", //TODO change to attack oriented color
                                    "attachment_type": "default",
                                    //TODO add tiny_url for attack symbol
                                    "actions": []
                                }];

                                /* TO DELETE
                                var attachmentTest = [
                                    [
                                        {
                                            name: "attack",
                                            type: "offensive"
                                        },
                                        {
                                            name: "strong attack",
                                            type: "offensive"
                                        }
                                    ],
                                    [
                                        {
                                            name: "guard",
                                            type: "defensive"
                                        },
                                        {
                                            name: "taunt",
                                            type: "defensive"
                                        }
                                    ]
                                ];

                                var actionArray = [];*/

                                var template = {
                                    "attachments": []
                                };

                                    //For each action the character can perform
                                    var actionPromises = characterActions.map(characterAction => {

                                        var actionTemplate;

                                        return new Promise((resolve, reject) => {
                                        //lookup that action Id's zone
                                        firebase.get(('action/' + characterAction.action_id))
                                            .then(action => {

                                                console.log('action.zone_id: ', action.zone_id);

                                                console.log('characterZoneID: ', characterZoneID);

                                                //Check each action's zone_id to see if it
                                                if (action.zone_id.indexOf(characterZoneID) > -1) {
                                                    console.log('Its a match!');

                                                    console.log('Matching actions attributes: ', action);

                                                    //look at action.type
                                                    //check if it exists in type array
                                                    //if it doesnt, add it as an element in the array
                                                    //if it does, add it to the array of the the same type of array

                                                    /* This works, adding a new version below - to delete this
                                                    if (actionArray.length === 0) {

                                                        //Push action into an array of its own
                                                        var subArray = [];

                                                        subArray.push(action);

                                                        console.log('Root array is empty adding');
                                                        actionArray.push(subArray);
                                                        console.log("empty root array: ", JSON.stringify(actionArray));

                                                    } else {

                                                        for (var i = 0; i < actionArray.length; i++) {

                                                            console.log('action array: ', JSON.stringify(actionArray));

                                                            console.log(i + ' actionArray[i][0].type: ', actionArray[i][0].type);

                                                            console.log(i + ' action.type: ', action.type);

                                                            console.log(i + ' array length: ', actionArray.length);

                                                                if (actionArray[i][0].type === action.type) {
                                                                    console.log('Found a match, pushing');
                                                                    actionArray[i].push(action);
                                                                    //return i;
                                                                    console.log("match itteration: ", JSON.stringify(actionArray));

                                                                    break;

                                                                }
                                                                //If no match was found, on last itteration push into array
                                                                else if (i === (actionArray.length - 1)) {
                                                                    console.log('Did not find a match, pushing to root');
                                                                    actionArray.push(action);
                                                                    console.log("not match itteration: ", JSON.stringify(actionArray));
                                                                }
                                                            }
                                                        //}
                                                    }*/



                                                    console.log('template: ', JSON.stringify(template));

                                                    //TODO attachment array will 
                                                    //If array is empty, build an attachment with the action
                                                    if (template.attachments.length === 0) {

                                                        console.log('passed template.attachments.length === 0 check');

                                                        //Push action into an array of its own
                                                        var subArray = [];

                                                        var attachmentFormat =  {
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

                                                        //console.log('Root array is empty adding');
                                                        //actionArray.push(subArray);
                                                        //console.log("empty root array: ", JSON.stringify(actionArray));

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
                                                                    "fallback":"You are unable to choose an action",
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
                                                        //}
                                                    }
                                                    

                                                    /* TO DELETE
                                                    if (action.type === "offensive") {
                                                        attachments[0].actions.push({
                                                            "name": action.name,
                                                            "text": action.name,
                                                            "style": "default",
                                                            "type": "button",
                                                            "value": action.name
                                                        })
                                                    }*/

                                                    resolve();

                                                }
                                                
                                            });
                                        });
                                    });

                                    Promise.all(actionPromises)
                                        .then(()=>{

                                            template.text = 'Choose an action';

                                            console.log('Final template resolved: ', JSON.stringify(template));

                                            resolve(template);

                                            //console.log("Promise all resolve: ", JSON.stringify(actionArray));

                                            //template.attachments = attachments;

                                            //console.log('Final actions template: ', JSON.stringify(template));
                                        })
                            });


                        /*
                        //Build a Slack attachment with all basic actions

                        //Iterate through actions
                        availableActionIDs.forEach(()=>{

                            //Lookup the action
                            firebase.get(('item/' + purchaseSelection))
                                .then( itemProps => {




                                });
                        });*/

                        /*
                        var attachments = [{
                            "title": "Basic actions",
                            "fallback": "You are unable to choose an action",
                            "callback_id": "actionMenu",
                            "color": "#3AA3E3", //TODO change to attack oriented color
                            "attachment_type": "default",
                            //TODO add tiny_url for attack symbol
                            "actions": [
                                {
                                    "name": "attack",
                                    "text": "Attack",
                                    "style": "default",
                                    "type": "button",
                                    "value": "attack"
                                }]
                        }];*/


                        /* TO DELETE
                        //Get the details of the character's class
                        firebase.get('class/' + class_id)
                            .then( characterClass=>{

                                console.log('Got characterClass: ', characterClass);

                                //Array of the action IDs the character can perform
                                var characterActions = characterClass.action_id;

                                var zoneActions = characterZone.action_id;

                                var availableActions = zoneActions.filter( zoneAction =>{

                                    //if (characterActions.includes(zoneActions)) {

                                    //}
                                    return characterActions.indexOf(zoneAction) > -1;
                                });
                                
                                console.log('availableActions: ', JSON.stringify(availableActions))

                            });*/

                        //For each action that can be performed in the zone, see if that character can perform

                    //});


                //In order to determine what actions are available, lookup that zone's actions

                //Finally, filter
                /*
                template.attachments = [
                    //Attack oriented actions
                    {
                        "title": "Attack actions",
                        "fallback": "You are unable to choose an action",
                        "callback_id": "actionMenu",
                        "color": "#3AA3E3", //TODO change to attack oriented color
                        "attachment_type": "default",
                        //TODO add tiny_url for attack symbol
                        "actions": [
                            {
                                "name": "attack",
                                "text": "Attack",
                                "style": "default",
                                "type": "button",
                                "value": "attack"
                            }]
                    },
                    //Defense oriented actions
                    {
                        "title": "Defensive actions",
                        "text": "No actions available in this zone", //Default value to be overwritten
                        "fallback": "You are unable to choose an action",
                        "callback_id": "actionMenu",
                        "color": "#3AA3E3", //TODO change to defense oriented color
                        "attachment_type": "default",
                        //TODO add tiny_url for defense symbol
                        "actions": [
                            {
                                "name": "defend",
                                "text": "Defend",
                                "style": "default",
                                "type": "button",
                                "value": "defend"
                            }]
                    }
                    //Magic oriented actions (to add)
                ];*/

                break;

            default:

                //Resolve default template
                resolve(template);
        }

        //Overwrite template default
        //template.text = 'Choose an action';

        //console.log('Final template resolved: ', JSON.stringify(template));

        //resolve(template);

    })
};