'use strict';

const slack = require('../../../libraries/slack');
const _ = require('lodash');

//const Character = require('../../../models/Character').Character;
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
        this.defaultActionPayload = {
            "username": this.actionCharacter.props.name,
            "icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
            "channel": ("#" + this.currentZone.props.channel),
            "attachments": [{
                "thumb_url": this.game.baseURL + this.game.thumbImagePath + this.actionTaken.props.image_id + '.png',
                "color": this.game.menuColor
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
            this.defaultActionPayload.attachments[0].text = this.channelActionFailMessage;
            slack.sendMessage(this.defaultActionPayload);
            return false;
        }

        //If the action is successful remove hidden effect (if applicable)
        //This is done before processing the action so you don't apply and immediately remove hiding effect
        this.actionCharacter.getEffectsWithModifier('is_hidden')
            .forEach( eachHidingEffect =>{

                //console.log('DEBUG _initiateAction called, eachHidingEffect: ', eachHidingEffect);

                this._reverseEffect(this.actionCharacter, eachHidingEffect.action_id);
            });

        //Push the effects into the effect queue
        this._insertActionInQueue();

        if (this.actionTaken.props.action_points_cost){
            //Decrement the action cost from character's Stamina points
            this.actionCharacter.incrementProperty('action_points', -this.actionTaken.props.action_points_cost);
        }

        if (this.actionTaken.props.stamina_cost){
            //Decrement the action cost from character's Mana Points
            this.actionCharacter.incrementProperty('stamina_cost', -this.actionTaken.props.stamina_cost);
        }

        return {
            "text": "action complete"
        }
    }

    //Return a random character object who is still alive in the current match
    _getUniqueRandomTarget(numberOfTargets){

        //Get targets, how can I standardize this?
        const targets = [];

        //let characterIDsInZone = gameObjects.game.getCharacterIDsInZone(gameObjects.requestZone.id);
        let charactersInZone = this.game.getCharactersInZone(this.currentZone.id);

        //Get an array of the character IDs on the character's team (including the player)
        let characterIDsOnTeam = this.game.getCharacterIDsOnTeam(this.actionCharacter.id);

        let availableTargets = charactersInZone
        //Filter out the player's team (including the player's character)
            .filter( eachCharacter =>{

                //Only include characters that are not in the characterIDsOnTeam array
                return characterIDsOnTeam.indexOf(eachCharacter.id) === -1;
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
    }

    _calculateStrength(base, modifier, variableMin, variableMax){
        return base + modifier + this._getRandomIntInclusive(Math.round(variableMin), Math.round(variableMax));
    }

    /* REFACTORING
    _calculateDamage(damage, mitigation){

        let totalDamage = damage - mitigation;

        if (totalDamage < 0) {
            return 0;
        }

        return totalDamage;
    }*/

    _calculateMagic(bonusDamageMultiplier){
        console.log(`Calculating Magic: magic_attack_power ${this.actionCharacter.props.stats_current.magic_attack_power},  magic_resistance ${this.targetCharacter.props.stats_current.magic_resistance}, damage_maximum ${this.actionTaken.props.damage_maximum}, damage_minimum ${this.actionTaken.props.damage_minimum}`);

        //Influence calculation Formula:
        //Influence = Absolute value of (AP - AC) / Least of AP or AC
        let attackMargin = this.actionCharacter.props.stats_current.magic_attack_power - this.targetCharacter.props.stats_current.magic_resistance;

        let bias, lesserCombatValue;

        //Set the bias as maximum if positive margin (power > mitigation)
        if (attackMargin >= 0){
            bias = this.actionTaken.props.damage_maximum;
            lesserCombatValue = this.actionCharacter.props.stats_current.magic_attack_power;
        } else {
            bias = this.actionTaken.props.damage_minimum;
            lesserCombatValue = this.targetCharacter.props.stats_current.magic_resistance;
        }

        let rawInfluence = (Math.abs(attackMargin) / lesserCombatValue);

        let influence;

        //Convert raw influence value into influence value to use in attack calculation
        //More than but not double:     30/20 --> .5 Influence --> .5 Influence
        //More than double:             125/50 --> 1.5 Influence --> 1 Influence
        //Much more than double:        400/30 --> 12.3 Influence --> 1 Influence
        //Less but not less than half:  25/30 --> .2 Influence --> .2 Influence
        //Less than half:               20/50 --> 1.5 Influence --> 1 Influence
        //Much less than half:          10/550 --> 54 Influence --> 1 Influence
        if (rawInfluence > 1){
            influence = 1;
        } else {
            influence = rawInfluence;
        }

        //Use the attack margin to determine bias & influence
        return this._calculateDamage(this.actionTaken.props.damage_minimum, this.actionTaken.props.damage_maximum, bias, influence, bonusDamageMultiplier)
    }

    _calculateMelee(bonusDamageMultiplier){

        //Influence calculation Formula:
        //Influence = Absolute value of (AP - AC) / Least of AP or AC
        let attackMargin = this.actionCharacter.props.stats_current.attack_power - this.targetCharacter.props.stats_current.attack_mitigation;

        let bias, lesserCombatValue;

        //Set the bias as maximum if positive margin (power > mitigation)
        if (attackMargin >= 0){
            bias = this.actionCharacter.props.stats_current.damage_maximum;
            lesserCombatValue = this.actionCharacter.props.stats_current.attack_power;
        } else {
            bias = this.actionCharacter.props.stats_current.damage_minimum;
            lesserCombatValue = this.targetCharacter.props.stats_current.attack_mitigation;
        }

        let rawInfluence = (Math.abs(attackMargin) / lesserCombatValue);

        let influence;

        //Convert raw influence value into influence value to use in attack calculation
        //More than but not double:     30/20 --> .5 Influence --> .5 Influence
        //More than double:             125/50 --> 1.5 Influence --> 1 Influence
        //Much more than double:        400/30 --> 12.3 Influence --> 1 Influence
        //Less but not less than half:  25/30 --> .2 Influence --> .2 Influence
        //Less than half:               20/50 --> 1.5 Influence --> 1 Influence
        //Much less than half:          10/550 --> 54 Influence --> 1 Influence
        if (rawInfluence > 1){
            influence = 1;
        } else {
            influence = rawInfluence;
        }

        //Use the attack margin to determine bias & influence
        return this._calculateDamage(this.actionCharacter.props.stats_current.damage_minimum, this.actionCharacter.props.stats_current.damage_maximum, bias, influence, bonusDamageMultiplier)
    }

    _calculateDamage(min, max, bias, influence, bonusDamageMultiplier){
        console.log(`Calculating damage, range: ${min} - ${max}, bias ${bias}, influence ${influence} bonus multiplier ${bonusDamageMultiplier}`);

        let bonusDamage;

        //Calculate a bonus damage depending on character level
        if (!bonusDamageMultiplier){
            bonusDamage = 0;
        } else {
            bonusDamage = (this.actionCharacter.props.level * bonusDamageMultiplier)
        }

        let rnd = Math.random() * (max - min) + min,   // random in range
            mix = Math.random() * influence;           // random mixer

        return Math.round((rnd * (1 - mix) + bias * mix) + bonusDamage);// mix full range and bias rounded + Bonus Damage
    }

    static _calculateBonusDamage(factor){
        if (!factor){
            return 0
        }

        return (this.actionCharacter.props.level * factor)
    }

    // Take action_queue

    //Filter it down to interrupted actions only.  For each interrupted action, send a message

    //Remove interrupted actions from the action_queue

    //Decrement health, processes action interrupts and hiding removal
    //Argument must be a character object
    _processDamage(target, damageAmount){
        console.log(`called _processDamage`);
        //Decrease target's health
        //this.targetCharacter.incrementProperty('stats_current.hit_points', -damageAmount);
        target.incrementProperty('hit_points', -damageAmount);

        let interruptedActionIndex = [];

        //Interrupt check: look in the action_queue for pending actions initiated by the target & interrupt them
        if (this.currentMatch.props.action_queue){

            this.currentMatch.props.action_queue
                //Filter for action types that this action can interrupt
                .filter( (eachActionQueue, index) => {

                    let eachAction = new Action(this.game.state, eachActionQueue.action_id);

                    //console.log('DEBUG eachAction.props from .filter: ', eachAction.props);

                    if (this.actionTaken.props.can_interrupt){

                        if (_.indexOf(this.actionTaken.props.can_interrupt, eachAction.props.type) > -1 &&
                            eachActionQueue.player_character_id === target.id &&
                            eachActionQueue.player_character_id !== this.actionCharacter.id){

                            //Store the array index so that it can be removed from action_queue
                            interruptedActionIndex.push(index);

                            return eachActionQueue
                        }
                    }
                })
                .map( eachActionQueue =>{

                    //console.log('DEBUG eachActionQueue: ', eachActionQueue);

                    let eachAction = new Action(this.game.state, eachActionQueue.action_id);

                    //console.log('DEBUG eachAction from .map: ', eachAction.props);

                    return eachAction

                })
                //Send interrupt messages and return final list of interrupted actions
                .forEach( eachInterruptedAction =>{

                    //console.log('DEBUG eachInterruptedAction.props: ', eachInterruptedAction.props);

                    this.defaultActionPayload.attachments[0].text = `${this.actionCharacter.props.name}'s ${this.actionTaken.props.name} *interrupts* ${target.props.name}'s pending ${eachInterruptedAction.props.name}!`;
                    slack.sendMessage(this.defaultActionPayload);

                    //return eachInterruptedAction
                });

            //For each element identified as an action to interrupt, remove that element from the action_queue
            interruptedActionIndex.forEach( eachActionToRemove =>{
                this.currentMatch.props.action_queue.splice(eachActionToRemove, 1)
            })

            //console.log('interruptedActions.length: ', interruptedActions.length);

            //Filter the actionQueue to remove interrupted actions
            /*REMOVE TEMPORARILY for testing
            this.currentMatch.props.action_queue = this.currentMatch.props.action_queue
                .filter( eachActionQueue =>{
                    //Filter queue to only contain actions who were initiated by a player that is not the target of this action OR were initiated
                    //by the player that is initiating this action
                    //return eachActionQueue.player_character_id !== this.targetCharacter.id || eachActionQueue.player_character_id === this.actionCharacter.id;
                    return eachActionQueue.player_character_id !== target.id || eachActionQueue.player_character_id === this.actionCharacter.id;
                })*/
        }

        //console.log('DEBUG Interrupted action index: ', interruptedActionIndex);

        //_reverseEffect(this.actionCharacter, eachEffect.action_id)

        let hidingEffects = target.getEffectsWithModifier('is_hidden');

        //If the target is hidden, break hiding and remove any hiding effects
        if (hidingEffects.length > 0){
            this.defaultActionPayload.attachments[0].text = `${this.actionCharacter.props.name}'s ${this.actionTaken.props.name} forces ${target.props.name} *out of hiding!*`;
            slack.sendMessage(this.defaultActionPayload);

            //Reverse each hiding effect
            hidingEffects.forEach( eachHidingEffect =>{
                this._reverseEffect(target, eachHidingEffect.action_id);
            });
        }
    }

    //modifiers should be an object of stat/modifier key/value pairs
    _changeProperty(characterToModify, modifiers){
        characterToModify.props = _.merge(characterToModify.props, modifiers);
    }

    _avoidCheck(accuracyModifier, avoidModifier){

        let accuracyScore = this.baseAccuracyScore + accuracyModifier + this._getRandomIntInclusive(1, 10);

        let avoidRandomInt = this._getRandomIntInclusive(1, 10);

        let avoidScore = this.baseAvoidScore + avoidModifier + avoidRandomInt;

        console.log('_isAvoided check, accuracyScore = ' + accuracyScore + ' avoidScore = ' + avoidScore);

        return (accuracyScore >= avoidScore);
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
        //this.actionCharacter.props.actions[actionKey].turn_available = newTurnAvailable;
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