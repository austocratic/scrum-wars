"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var attackCharacterSelection = require('../../slackTemplates/attackCharacterSelection').attackCharacterSelection;
var actionUnavailable = require('../../slackTemplates/actionUnavailable').actionUnavailable;
var actionCoolDown = require('../../slackTemplates/actionCoolDown').actionCoolDown;
var defendCharacterSelection = require('../../slackTemplates/defendCharacterSelection').defendCharacterSelection;
var shopCharacterSelection = require('../../slackTemplates/shopCharacterSelection').shopCharacterSelection;

var Action = require('../Action').Action;
var Character = require('../Character').Character;
var Match = require('../Match').Match;

var getCharacters = require('../../components/zone/getCharacters').getCharacters;

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
        if (character.props.turn_action_used <= match.number_turns) {
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

        var characterAction = character.props.actions.find( singleAction =>{
           return singleAction.action_id === actionID
        });

        console.log('characterAction: ', characterAction);

        //If turn one, all actions are available
        if (match.number_turns === 1) {
            return true
        } else {
            if (characterAction.turn_used + action.cool_down <= match.number_turns) {
                return true
            } else {
                return false
            }
        }
    }
    
    return new Promise((resolve, reject) => {

        var playerCharacter = new Character();
        playerCharacter.setByProperty('user_id', userID)
            .then( () => {

                var actionCalled = new Action();
                actionCalled.setByID(payload.actions[0].value)
                    .then( () => {

                        //Lookup the current match ID
                        firebase.get('global_state/match_id')
                            .then(matchID => {

                                //Get the details of that match
                                var currentMatch = new Match();
                                currentMatch.setByID(matchID)
                                    .then( () => {

                                        initiateAction(playerCharacter, currentMatch.props, actionCalled.props)
                                            .then( responseTemplate =>{
                                                resolve(responseTemplate)
                                            });
                                    });
                            });
                    });
            });
    });

    //Call action specifics
    function initiateAction(playerCharacter, matchDetails, actionDetails){

        return new Promise((resolve, reject) =>{

            switch (payload.actions[0].value) {

                //TODO: currently hard coding action ID, need to make these dynamic
                //Attack action
                case '-Kjpe29q_fDkJG-73AQO':

                    //If actions are available build the attack template, otherwise build the unavailable template
                    if (areActionsAvailable(playerCharacter, matchDetails)) {

                        if (isActionAvailable(playerCharacter.props.id, playerCharacter, payload.actions[0].value, actionDetails, matchDetails)) {

                            //Return the default template
                            responseTemplate = attackCharacterSelection();

                            getCharacters.getNamesExcludePlayerCharacter(playerCharacter.props.zone_id, playerCharacter.props.id)
                                .then( namesInZone =>{

                                    console.log('namesInZones: ', JSON.stringify(namesInZone));

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

                            var characterAction = playerCharacter.props.actions.find( singleAction =>{
                                return singleAction.action_id === payload.actions[0].value
                            });

                            var turnsToCoolDown = characterAction.turn_used + actionDetails.cool_down - matchDetails.number_turns;
                            responseTemplate = actionCoolDown(turnsToCoolDown);

                            resolve(responseTemplate);
                        }
                    } else {
                        responseTemplate = actionUnavailable();

                        resolve(responseTemplate);
                    }

                    break;

                //TODO: currently hard coding action ID, need to make these dynamic
                //Defend action
                case '-KjpeJT7Oct3ZCtLhENO':

                    //If actions are available build the attack template, otherwise build the unavailable template
                    if (areActionsAvailable(playerCharacter, matchDetails)) {

                        if (isActionAvailable(playerCharacter.props.id, playerCharacter, payload.actions[0].value, actionDetails, matchDetails)) {

                    //Return the default template
                    responseTemplate = defendCharacterSelection();

                    //Get the slack user ID who called the action
                    //userID = payload.user.id;

                    //Set your is_defending property
                    playerCharacter.updateProperty('is_defending', true)
                        .then(()=> {
                            //Then return the new template
                            resolve(responseTemplate)
                        });

                        } else {

                            var characterAction = playerCharacter.props.actions.find( singleAction =>{
                                return singleAction.action_id === payload.actions[0].value
                            });

                            var turnsToCoolDown = characterAction.turn_used + actionDetails.cool_down - matchDetails.number_turns;
                            responseTemplate = actionCoolDown(turnsToCoolDown);

                            resolve(responseTemplate);
                        }
                    } else {
                        responseTemplate = actionUnavailable();

                        resolve(responseTemplate);
                    }

                    break;

                //Action "Into Shadow"
                case '-Kkdk_CD5vx8vRGQD268':

                    //If actions are available build the attack template, otherwise build the unavailable template
                    if (areActionsAvailable(playerCharacter, matchDetails)) {

                        if (isActionAvailable(playerCharacter.props.id, playerCharacter, payload.actions[0].value, actionDetails, matchDetails)) {


                        } else {

                            var characterAction = playerCharacter.props.actions.find( singleAction =>{
                                return singleAction.action_id === payload.actions[0].value
                            });

                            var turnsToCoolDown = characterAction.turn_used + actionDetails.cool_down - matchDetails.number_turns;
                            responseTemplate = actionCoolDown(turnsToCoolDown);

                            resolve(responseTemplate);
                        }
                    } else {
                        responseTemplate = actionUnavailable();

                        resolve(responseTemplate);
                    }

                    break;

                //Shop action ID
                case '-KkJVqtBIhpAKBfz9tcb':

                    //Return the default template
                    responseTemplate = shopCharacterSelection();

                    //Get the merchant in the player's zone
                    firebase.get('merchant', 'zone_id', playerCharacter.props.zone_id)
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