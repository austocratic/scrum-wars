'use strict';

const Slack = require('../../../libraries/slack').Alert;
const _ = require('lodash');


class BaseAction {
    constructor(gameObjects){

        this.game = gameObjects.game;
        this.actionCharacter = gameObjects.playerCharacter;
        this.currentZone = gameObjects.requestZone;
        this.currentMatch = gameObjects.currentMatch;
        this.actionTaken = gameObjects.actionTaken;
        this.targetCharacter = gameObjects.targetCharacter;

        this.slackIcon = gameObjects.game.baseURL + "assets/thumb/" + this.actionTaken.id + ".jpg";
        //this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        this.slackUserName = "A mysterious voice";
        this.slackChannel = ("#" + this.currentZone.props.channel);
    }

    _getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    _successCheck(modifier){

        let successChance = this.baseSuccessChance + modifier;

        if ((this._getRandomIntInclusive(0, 100) >= ((1 - successChance) * 100))) {

            return true
        }

        //If check returned true (if successful, it will never get to this point to alert Slack)
        
        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": this.slackChannel,
            "text": this.channelActionFailMessage
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);

        return false;
    }

    _calculateStrength(base, modifier, variableMin, variableMax){

        var calculatedStrength = base + modifier + this._getRandomIntInclusive(Math.round(variableMin), Math.round(variableMax));
        
        return calculatedStrength;
    }

    //Object of stat/modifier key/value pairs
    _changeProperty(characterToModify, modifiers){

        //console.log('called _changeProperty, modifiers: ', modifiers);

        //var mergedProperty = Object.assign(characterToModify.props, modifiers);

        //console.log('mergedProperties: ', mergedProperty);

        //characterToModify.props = mergedProperty;

        var mergedProperty = _.merge(characterToModify.props, modifiers);

        //console.log('mergedProperties, using lodash: ', mergedProperty);

        characterToModify.props = mergedProperty;

        //{is_available: 1, nested: {prop1:1, prop2:2}}

        //{nested:{ prop1:1, prop2: 1}, nested:{prop2:2}} --> {nested:{ prop1:1, prop2: 2} }

        /*
         //Convert all keys into array
         var modifierKeys = Object.keys(modifiers);

         if (modifierKeys.length > 0) {
         modifierKeys.forEach( eachModifierKey =>{

         console.log('each modifier key: ', eachModifierKey);

         console.log('character with reference: ', characterToModify.props[eachModifierKey]);

         characterToModify.props[eachModifierKey] = modifiers[eachModifierKey];

         //characterToModify.incrementProperty(eachModifierKey, modifiers[eachModifierKey]);
         })
         }*/
    }

    //modifiers = {is_active: -1}

    _avoidCheck(accuracyModifier, avoidModifier){

        var accuracyScore = this.baseAccuracyScore + accuracyModifier + this._getRandomIntInclusive(1, 10);
        var avoidScore = this.baseAvoidScore + avoidModifier + this._getRandomIntInclusive(1, 10);
        console.log('_isAvoided check, accuracyScore = ' + accuracyScore + ' avoidScore = ' + avoidScore);

        if(accuracyScore >= avoidScore){
            return true
        }

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": this.slackChannel,
            "text": this.channelActionAvoidedMessage
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);

        return false
    }

    _applyEffect(characterToModify, modifiers){

        //TODO add standard validation function check

        //Convert all keys into array
        /*
         var modifierKeys = Object.keys(modifiers);

         var modifierObject = {};

         if (modifierKeys.length > 0) {
         modifierKeys.forEach( eachModifierKey =>{
         modifierObject = Object.assign(modifierObject, {[eachModifierKey]: modifiers[eachModifierKey]});
         })
         }*/

        //var modifierObject = {};

        //modifierObject = Object.assign(modifierObject, modifiers);

        console.log('DEBUG: actionTaken: ', this.actionTaken);

        var endingTurn = this.currentMatch.props.number_turns + this.actionTaken.props.effect_duration;

        //console.log('Modifier object: ', modifierObject);

        //console.log('modifiers passed in: ', modifiers);

        //If character has a effects array, add the action ID to it, else create an effects array and add to it
        if (characterToModify.props.effects){
            characterToModify.props.effects.push({
                action_id: this.actionTaken.id,
                end_turn: endingTurn,
                type: this.actionTaken.props.type,
                modifiers: modifiers
                //modifiers: modifierObject
            });
        } else {
            characterToModify.props.effects = [{
                action_id: this.actionTaken.id,
                end_turn: endingTurn,
                type: this.actionTaken.props.type,
                modifiers: modifiers
                //modifiers: modifierObject
            }]
        }

        //Update the character's properties
        this._changeProperty(characterToModify, modifiers)
    }

    _reverseEffect(characterToModify, actionID){

        var arrayIndex = _.findIndex(characterToModify.props.effects, {'action_id': actionID});

        if (arrayIndex === -1){
            console.log('"Attempted to reverse actionID that does not exist on the target"');
            return "Attempted to reverse actionID that does not exist on the target"
        }

        var modifiersToRemove = characterToModify.props.effects[arrayIndex].modifiers;

        console.log('modifiersToRemove: ', modifiersToRemove);

        //Look at modifiers to determine if there are any nested properties:
        var modifierKeys = Object.keys(modifiersToRemove);

        if (modifierKeys.length > 0) {
            modifierKeys.forEach( eachModifierKey => {

                var nestedProperty = modifiersToRemove[eachModifierKey];

                var nestedKeys = Object.keys(nestedProperty);

                //If key is nested
                if (nestedKeys.length > 0) {
                    getNestedKeys(nestedProperty);
                }
            })
        }

        function getNestedKeys(nestedProperty){

            var nestedKeys = Object.keys(nestedProperty);

            nestedKeys.forEach( eachNestedKey =>{
                var nestedValue = nestedProperty[eachNestedKey];
            });
        }

        //Remove effect
        characterToModify.props.effects.splice(arrayIndex, 1);
    }

    updateAction(){

        //Take the current actionControllers
        //var currentActions = this.actionCharacter.props.actionControllers;

        var actionKey = _.findKey(this.actionCharacter.props.actions, {'action_id': this.actionTaken.id});

        var actionID = this.actionCharacter.props.actions[actionKey].action_id;

        var newTurnAvailable = this.currentMatch.props.number_turns + this.actionTaken.props.cool_down;
        var newTurnUsed = this.currentMatch.props.number_turns;

        //actionsToUpdate[actionKey].turn_available = actionsToUpdate;
        this.actionCharacter.props.actions[actionKey].turn_available = newTurnAvailable;
        this.actionCharacter.props.actions[actionKey].turn_used = newTurnUsed;
    }
}

//Attach validations to the BaseAction
BaseAction.validations = [
    'game',
    'playerCharacter',
    'requestZone',
    'currentMatch',
    'actionTaken',
    'targetCharacter'
];

module.exports = {
    BaseAction
};