'use strict';

const slack = require('../../../libraries/slack').Alert;
const _ = require('lodash');

const Character = require('../../../models/Character').Character;

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

    //TODO this should probably be moved to the helpers file
    _getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //All actions call this function when invoked
    _initiateAction(){

        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            this.slackPayload.text = this.channelActionFailMessage;
            slack.sendMessage(this.slackPayload);
            return false;
        }

        //Push the effects into the effect queue
        this._insertActionInQueue();

        //Process the action with turn 0
        this.process(0);

        return {
            "text": "action complete"
        }
    }

    //Return a random character object who is still alive in the current match
    _getRandomTarget(targetsToExclude){

        //Returns an array of character IDs
        let startingCharacterObjects = this.currentMatch.getStartingCharacterIDs()
            .map( eachStartingCharacterID =>{
                return new Character(this.game.state, eachStartingCharacterID)
            })
            //Filter for characters in the zone (alive characters)
            .filter( eachCharacter =>{
                return eachCharacter.props.zone_id === this.currentMatch.props.zone_id
            })
            //Filter for all characters but the character performing the action
            .filter( eachCharacterInZone =>{
                return eachCharacterInZone.id !== this.actionCharacter.id
            })
            //Filter out characters that are included in the targetsToExclude argument
            .filter( eachCharacterInZone =>{

                let foundTarget = targetsToExclude.find( eachTargetToExclude =>{
                    return eachTargetToExclude.id === eachCharacterInZone.id;
                });

                return foundTarget === undefined
            });

        //console.log('startingCharacterObjects: ', startingCharacterObjects);

        //If there are no available targets return undefined
        if(startingCharacterObjects.length === 0){
            return undefined
        }

        //Return a random character object from filtered array of character objects
        return startingCharacterObjects[this._getRandomIntInclusive(0, startingCharacterObjects.length - 1)]
    }

    //Return a random character object who is still alive in the current match
    _getUniqueRandomTarget(numberOfTargets){

        //Get targets, how can I standardize this?
        const targets = [];

        //Returns an array of character IDs
        let availableTargets = this.currentMatch.getStartingCharacterIDs()
            .map( eachStartingCharacterID =>{
                return new Character(this.game.state, eachStartingCharacterID)
            })
            //Filter for characters in the zone (alive characters)
            .filter( eachCharacter =>{
                return eachCharacter.props.zone_id === this.currentMatch.props.zone_id
            })
            //Filter for all characters but the character performing the action
            .filter( eachCharacterInZone =>{
                return eachCharacterInZone.id !== this.actionCharacter.id
            });

        //If desired # of targets is greater than the # of available targets, only return # of available targets
        if (availableTargets.length < numberOfTargets){
            numberOfTargets = availableTargets.length
        }

        for (let i = 0; i < numberOfTargets; i++) {
            availableTargets
                //Filter out characters that are already found
                .filter( eachCharacterInZone =>{
                    let foundTarget = targets.find( eachTargetToExclude =>{
                        return eachTargetToExclude.id === eachCharacterInZone.id;
                    });
                    return foundTarget === undefined
                });
            //Return a random character object from filtered array of character objects
            targets.push(availableTargets[this._getRandomIntInclusive(0, availableTargets.length - 1)]);
        }

        return targets
    }

    _successCheck(modifier){

        let successChance = this.baseSuccessChance + modifier;

        if ((this._getRandomIntInclusive(0, 100) >= ((1 - successChance) * 100))) {

            return true
        }

        //If check returned true (if successful, it will never get to this point to alert Slack)
        
        //Alert the channel of the action
        /*
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": this.slackChannel,
            "text": this.channelActionFailMessage
        };*/

        //Create a new slack alert object
        //var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        //channelAlert.sendToSlack(this.params);

        return false;
    }

    _calculateStrength(base, modifier, variableMin, variableMax){
        return base + modifier + this._getRandomIntInclusive(Math.round(variableMin), Math.round(variableMax));
    }

    _calculateDamage(damage, mitigation){

        let totalDamage = damage - mitigation;

        if (totalDamage < 0) {
            return 0;
        }

        return totalDamage;
    }

    //TODO working on 11/13/17
    _applyDamage(){
        let calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

        //Check if the target has a barrier
        /*
        let targetCharacterShielding = this.targetCharacter.props.effects.find( eachEffect =>{
            return eachEffect.type === "shield"
        });

        //Target has shielding.  Apply damage to shielding
        if (targetCharacterShielding){

        }*/

        this.targetCharacter.incrementProperty('health', -calculatedDamage);
    }

    //modifiers should be an object of stat/modifier key/value pairs
    _changeProperty(characterToModify, modifiers){
        characterToModify.props = _.merge(characterToModify.props, modifiers);
    }

    //modifiers should be an object of stat/modifier key/value pairs
    //Take the properties passed in add them to existing properties
    /*
    _incrementProperties(characterToModify, modifiers){
        characterToModify.props = _.mergeWith(characterToModify.props, modifiers, (objValue, srcValue) =>{
            return objValue + srcValue
        });
    }*/

    _avoidCheck(accuracyModifier, avoidModifier){

        let accuracyScore = this.baseAccuracyScore + accuracyModifier + this._getRandomIntInclusive(1, 10);

        let avoidRandomInt = this._getRandomIntInclusive(1, 10);

        let avoidScore = this.baseAvoidScore + avoidModifier + avoidRandomInt;

        //console.log('DEBUG this.baseAvoidScore: ', this.baseAvoidScore);
        //console.log('DEBUG avoidModifier: ', avoidModifier);
        //console.log('DEBUG avoidRandomInt: ', avoidRandomInt);

        console.log('_isAvoided check, accuracyScore = ' + accuracyScore + ' avoidScore = ' + avoidScore);

        return (accuracyScore >= avoidScore);


        /* Replaced by above, test
        if(accuracyScore >= avoidScore){
            return true
        }

        return false*/
    }

    _applyEffect(characterToModify, modifiers){

        //If character has a effects array, add the action ID to it, else create an effects array and add to it
        if (characterToModify.props.effects){
            characterToModify.props.effects.push({
                action_id: this.actionTaken.id,
                applied_by_character_id: this.actionCharacter.id,
                turn_applied: this.currentMatch.number_turns,
                //end_turn: endingTurn,
                type: this.actionTaken.props.type,
                modifiers: modifiers
                //modifiers: modifierObject
            });
        } else {
            characterToModify.props.effects = [{
                action_id: this.actionTaken.id,
                applied_by_character_id: this.actionCharacter.id,
                turn_applied: this.currentMatch.number_turns,
                //end_turn: endingTurn,
                type: this.actionTaken.props.type,
                modifiers: modifiers
                //modifiers: modifierObject
            }]
        }

        //Update the character's properties
        //this._incrementProperties(characterToModify, modifiers)
    }

    _reverseEffect(characterToModify, actionID){

        let arrayIndex = _.findIndex(characterToModify.props.effects, {'action_id': actionID});

        if (arrayIndex === -1){
            console.log('"Attempted to reverse actionID that does not exist on the target"');
            return "Attempted to reverse actionID that does not exist on the target"
        }

        let modifiersToRemove = characterToModify.props.effects[arrayIndex].modifiers;

        console.log('modifiersToRemove: ', modifiersToRemove);

        //Look at modifiers to determine if there are any nested properties:
        let modifierKeys = Object.keys(modifiersToRemove);

        if (modifierKeys.length > 0) {
            modifierKeys.forEach( eachModifierKey => {

                let nestedProperty = modifiersToRemove[eachModifierKey];

                let nestedKeys = Object.keys(nestedProperty);

                //If key is nested
                if (nestedKeys.length > 0) {
                    getNestedKeys(nestedProperty);
                }
            })
        }

        function getNestedKeys(nestedProperty){

            let nestedKeys = Object.keys(nestedProperty);

            nestedKeys.forEach( eachNestedKey =>{
                let nestedValue = nestedProperty[eachNestedKey];
            });
        }

        //Remove effect
        characterToModify.props.effects.splice(arrayIndex, 1);
    }

    _insertEffectsInQueue(){

        //If the match does not have an effect_queue, create one as empty array
        if(!this.currentMatch.props.effect_queue){
            this.currentMatch.props.effect_queue = [];
        }

        //Push each of the action's effects into the queue
        this.effectQueue.forEach( eachEffect =>{
            this.currentMatch.props.effect_queue.push(eachEffect)
        })
    }

    _insertActionInQueue(){

        //If the match does not have an action_queue, create one as empty array
        if(!this.currentMatch.props.action_queue){
            this.currentMatch.props.action_queue = [];
        }

        //Push the action ID into the action queue
        this.currentMatch.props.action_queue.push({
            "action_id": this.actionTaken.id,
            "turn_initiated": this.currentMatch.props.number_turns,
            "channel_id": this.currentZone.props.channel_id,
            "player_character_id": this.actionCharacter.id,
            "target_character_id": this.targetCharacter.id
        })
    }

    _deleteActionInQueue(){

        if(!this.currentMatch.props.action_queue) {
            return
        }

        //let actionToRemoveID = this.currentMatch.props.action_queue.indexOf(this.actionTaken.id);
        let actionToRemoveID = this.currentMatch.props.action_queue.find( eachActionInQueue =>{
            return eachActionInQueue.action_id === this.actionTaken.id;
        });

        if(actionToRemoveID !== -1) {
            this.currentMatch.props.action_queue.splice(actionToRemoveID, 1);
        }
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