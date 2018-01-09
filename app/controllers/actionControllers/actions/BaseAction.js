'use strict';

const slack = require('../../../libraries/slack');
const _ = require('lodash');

const Character = require('../../../models/Character').Character;
const Action = require('../../../models/Action').Action;

class BaseAction {
    constructor(gameObjects){

        this.game = gameObjects.game;
        this.actionCharacter = gameObjects.playerCharacter;
        this.currentZone = gameObjects.requestZone;
        this.currentMatch = gameObjects.currentMatch;
        this.actionTaken = gameObjects.actionTaken;
        this.targetCharacter = gameObjects.targetCharacter;

        //Base Slack template
        this.slackPayload = {
            "username": this.actionCharacter.props.name,
            "icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
            "channel": ("#" + this.currentZone.props.channel),
            "attachments": [{
                "thumb_url": this.game.baseURL + this.game.skillImagePath + this.actionTaken.props.image_id + '.png'
                //Testing with a .gif
                //"thumb_url": this.game.baseURL + this.game.imagePath + this.actionTaken.props.image_id + '.gif'
            }]
        };
    }

    //TODO this should probably be moved to the helpers file
    _getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //All actions call this function when invoked
    _initiateAction(){
        console.log('_initiateAction() called');

        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            this.slackPayload.attachments[0].text = this.channelActionFailMessage;
            slack.sendMessage(this.slackPayload);
            return false;
        }

        //If the action is successful remove hidden effect (if applicable)
        //This is done before processing the action so you don't apply and immediately remove hiding effect
        this.actionCharacter.getEffectsWithModifier('is_hidden')
            .forEach( eachHidingEffect =>{

                console.log('DEBUG _initiateAction called, eachHidingEffect: ', eachHidingEffect);

                this._reverseEffect(this.actionCharacter, eachHidingEffect.action_id);
            });

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
            })
            //Filter for active characters only (may have gone inactive after match started)
            .filter( eachCharacter => {
                return eachCharacter.props.active === 1
            });

        //If desired # of targets is greater than the # of available targets, only return # of available targets
        if (availableTargets.length < numberOfTargets){
            numberOfTargets = availableTargets.length
        }

        for (let i = 0; i < numberOfTargets; i++) {
            let availableTargetsNotChosen = availableTargets
                //Filter out characters that are already found
                .filter( eachAvailableTarget =>{
                    let foundTarget = targets.find( eachTarget =>{
                        return eachTarget.id === eachAvailableTarget.id;
                    });

                    if (!foundTarget){
                        return eachAvailableTarget
                    }
                });

            //Return a random character object from filtered array of character objects
            targets.push(availableTargetsNotChosen[this._getRandomIntInclusive(0, availableTargetsNotChosen.length - 1)]);
        }
        return targets
    }

    _successCheck(modifier){

        let successChance = this.baseSuccessChance + modifier;

        return this._getRandomIntInclusive(0, 100) >= ((1 - successChance) * 100);
        
        /*
        if ((this._getRandomIntInclusive(0, 100) >= ((1 - successChance) * 100))) {

            return true
        }

        return false;*/
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

    _processDamage(){
        console.log('called _processDamage()')
        //Decrease target's health
        this.targetCharacter.incrementProperty('health', -this.calculatedDamage);

        //TODO an action should have a property can_interrupt [] which is an array of action types that it is able to interrupt
        //console.log('DEBUG this.currentMatch.props.actionQueue BEFORE: ', this.currentMatch.props.action_queue);

        //Interrupt check: look in the action_queue for pending actions initiated by the target & interrupt them
        if (this.currentMatch.props.action_queue){

            this.currentMatch.props.action_queue
                //Filter out pending actions initiated by a target of player's action (don't filter the player's own actions)
                .filter( eachActionQueue =>{
                    return eachActionQueue.player_character_id === this.targetCharacter.id &&
                        eachActionQueue.player_character_id !== this.actionCharacter.id;
                })
                //Send interrupt messages and return final list of interrupted actions
                .forEach( eachInterruptedAction =>{

                    //console.log('DEBUG eachInterruptedAction: ', eachInterruptedAction);
                    let interruptedAction = new Action(this.game.state, eachInterruptedAction.action_id);
                    //console.log('DEBUG eachInterruptedAction object: ', interruptedAction.props);
                    this.slackPayload.attachments[0].text = `${this.actionCharacter.props.name}'s ${this.actionTaken.props.name} *interrupts* ${this.targetCharacter.props.name}'s pending ${interruptedAction.props.name}!`;
                    //console.log('DEBUG interrupt message: ', this.slackPayload.attachments[0].text);
                    slack.sendMessage(this.slackPayload);

                    //return eachInterruptedAction
                });

            //console.log('interruptedActions.length: ', interruptedActions.length);

            //Filter the actionQueue to remove interrupted actions
            this.currentMatch.props.action_queue = this.currentMatch.props.action_queue
                .filter( eachActionQueue =>{
                    //Filter queue to only contain actions who were initiated by a player that is not the target of this action OR were initiated
                    //by the player that is initiating this action
                    return eachActionQueue.player_character_id !== this.targetCharacter.id || eachActionQueue.player_character_id === this.actionCharacter.id;
                })
        }

        //_reverseEffect(this.actionCharacter, eachEffect.action_id)

        let hidingEffects = this.targetCharacter.getEffectsWithModifier('is_hidden');

        //If the target is hidden, break hiding and remove any hiding effects
        if (hidingEffects.length > 0){
            this.slackPayload.attachments[0].text = `${this.actionCharacter.props.name}'s ${this.actionTaken.props.name} forces ${this.targetCharacter.props.name} *out of hiding!*`;
            slack.sendMessage(this.slackPayload);

            //Reverse each hiding effect
            hidingEffects.forEach( eachHidingEffect =>{
                this._reverseEffect(this.targetCharacter, eachHidingEffect.action_id);
            });
        }
    }

    /*
    _applyDamage(){
        let calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

        //Check if the target has a barrier
        
        let targetCharacterShielding = this.targetCharacter.props.effects.find( eachEffect =>{
            return eachEffect.type === "shield"
        });

        //Target has shielding.  Apply damage to shielding
        if (targetCharacterShielding){

        }

        this.targetCharacter.incrementProperty('health', -calculatedDamage);
    }*/

    //modifiers should be an object of stat/modifier key/value pairs
    _changeProperty(characterToModify, modifiers){
        characterToModify.props = _.merge(characterToModify.props, modifiers);
    }

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

    //Moved from BaseModify file - is this used?
    _reverseEffectsOfType(character, effectType){

        var characterEffects = character.props.effects;

        //Lookup all actionControllers that have the same type as the actionTaken
        var effectsOfSameType = _.filter(characterEffects, {type: effectType});

        console.log('effectsOfSameType: ', effectsOfSameType);

        effectsOfSameType.forEach( eachEffect =>{
            this._reverseEffect(this.targetCharacter, eachEffect.action_id);
        });
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
            "target_character_id": this.targetCharacter.id,
            "last_turn_processed": this.currentMatch.props.number_turns
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