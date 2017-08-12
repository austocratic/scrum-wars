'use strict';

var Slack = require('../libraries/slack').Alert;
var _ = require('lodash');




class BaseAction {
    constructor(actionCharacter, currentZone, currentMatch, actionTaken){

        this.actionCharacter = actionCharacter;
        this.currentZone = currentZone;
        this.currentMatch = currentMatch;
        this.actionTaken = actionTaken;

        this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        this.slackUserName = "A mysterious voice";
        this.slackChannel = ("#" + this.currentZone.props.channel);
    }

    _setValues(){
        console.log('BaseAction setvalues called');

        this.levelMultiplier = ( 1 + (this.actionCharacter.props.level / 100));
        //this.variablePower =  + this.actionCharacter.props.strength * this.levelMultiplier;
        //this.variableMin = this.variablePower + this.baseMin;
        //this.variableMax = this.variablePower + this.baseMax
    }

    _getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    _successCheck(modifier){

        var successChance = this.baseSuccessChance + modifier;

        if ((this._getRandomIntInclusive(0, 100) >= ((1 - successChance) * 100))) {

            return true
        }

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

    /*
    _successCheck(modifier){

        var successChance = this.baseSuccessChance + modifier;

        if ((this._getRandomIntInclusive(0, 100) >= ((1 - successChance) * 100))) {
            return(true)
        }

        return(false);
    }*/

    _compareScores(){

    }

    /*
    _isAvoided(avoidChance){
        console.log('called isAvoided');

        var diceRoll = (this._getRandomIntInclusive(0, 100));

        console.log('diceRoll: ', diceRoll);

        var targetResult = (avoidChance * 100);

        console.log('targetResult: ', targetResult);

        if (diceRoll <= targetResult) {
            return(true)
        }

        return(false);
    }*/

    /*
    _calculatePower(basePower, modifier, variableMin, variableMax){

        console.log('called _calculatePower');
        console.log('_calculatePower, basePower: ', basePower);
        console.log('_calculatePower, modifier: ', modifier);
        console.log('_calculatePower, variableMin: ', variableMin);
        console.log('_calculatePower, variableMax: ', variableMax);

        var calculatedPower = basePower + modifier + this._getRandomIntInclusive(Math.round(variableMin), Math.round(variableMax));

        console.log('calculatedPower: ', calculatedPower);
        return calculatedPower;
    }*/

    _calculateStrength(base, modifier, variableMin, variableMax){

        var calculatedStrength = base + modifier + this._getRandomIntInclusive(Math.round(variableMin), Math.round(variableMax));

        console.log('calculatedStrength: ', calculatedStrength);
        return calculatedStrength;
    }

    //Object of stat/modifier key/value pairs
    _changeProperty(characterToModify, modifiers){

        //Convert all keys into array
        var modifierKeys = Object.keys(modifiers);

        if (modifierKeys.length > 0) {
            modifierKeys.forEach( eachModifierKey =>{

                characterToModify.incrementProperty(eachModifierKey, modifiers[eachModifierKey]);
            })
        }
    }

    _applyEffect(characterToModify, modifiers, actionTaken){

        //Convert all keys into array
        var modifierKeys = Object.keys(modifiers);

        var modifierObject = {};

        if (modifierKeys.length > 0) {
            modifierKeys.forEach( eachModifierKey =>{
                modifierObject = Object.assign(modifierObject, {[eachModifierKey]: modifiers[eachModifierKey]});
            })
        }

        var endingTurn = this.currentMatch.props.number_turns + actionTaken.props.effect_duration;

        //If character has a effects array, add the action ID to it, else create an effects array and add to it
        if (characterToModify.props.effects){
            characterToModify.props.effects.push({
                action_id: actionTaken.id,
                end_turn: endingTurn,
                type: actionTaken.props.type,
                modifiers: modifierObject
            });
        } else {
            characterToModify.props.effects = [{
                action_id: actionTaken.id,
                end_turn: endingTurn,
                type: actionTaken.props.type,
                modifiers: modifierObject
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

        var effectsToRemove = characterToModify.props.effects[arrayIndex].modifiers;

        //Functionality from _changeProperty but with negative values
        var modifierKeys = Object.keys(effectsToRemove);

        if (modifierKeys.length > 0) {
            modifierKeys.forEach( eachModifierKey =>{

                characterToModify.incrementProperty(eachModifierKey, -(effectsToRemove[eachModifierKey]));
            })
        }

        characterToModify.props.effects.splice(arrayIndex, 1);
    }

    updateAction(){

        //Take the current actions
        //var currentActions = this.actionCharacter.props.actions;

        var actionKey = _.findKey(this.actionCharacter.props.actions, {'action_id': this.actionTaken.id});

        var actionID = this.actionCharacter.props.actions[actionKey].action_id;

        var newTurnAvailable = this.currentMatch.props.number_turns + this.actionTaken.props.cool_down;
        var newTurnUsed = this.currentMatch.props.number_turns;

        //actionsToUpdate[actionKey].turn_available = actionsToUpdate;
        this.actionCharacter.props.actions[actionKey].turn_available = newTurnAvailable;
        this.actionCharacter.props.actions[actionKey].turn_used = newTurnUsed;
    }
}

class BaseAttack extends BaseAction{
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
        super(actionCharacter, currentZone, currentMatch, actionTaken);

        this.targetCharacter = targetCharacter;
    }

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

    /*
    _setValues(){

        this.chanceToAvoid = this.baseChanceToAvoid + (this.targetCharacter.props.dexterity / 100);
        this.damageMitigation = (this.targetCharacter.props.toughness + this.targetCharacter.props.armor) / 10;

        super._setValues();
    }*/

    _calculateDamage(damage, mitigation){

        var totalDamage = damage - mitigation;

        if (totalDamage < 0) {
            return 0;
        }

        return totalDamage;
    }
}

class BaseModify extends BaseAction{
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
        super(actionCharacter, currentZone, currentMatch, actionTaken);

        this.targetCharacter = targetCharacter;
    }

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
}

//AranceBolt is a spell that deals damage to a single target

class ArcaneBolt extends BaseAttack {
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
        super(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
    }

    initiate() {
        this.channelActionFailMessage = (this.actionCharacter.props.name + " attempts to conjure an Arcane Bolt, but the spell fizzles away!");
        this.channelActionAvoidedMessage = (this.actionCharacter.props.name + " bolts of arcane energy streak from  " + this.actionCharacter.props.name + "'s fingers, but " + this.targetCharacter.props.name + " resists the bolt's harm");

        //BaseAction
        //skill check: this.baseSuccessChance + modifier
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            console.log('Skill FAILED!');
            return this.playerActionFailedMessage
        }

        //Evasion check
        //Arguments: accuracyModifier, avoidModifier
        if (this._avoidCheck(0, 0) === false) {
            console.log('Target evaded!');
            return this.playerActionAvoidedMessage
        }

        var power = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);

        var mitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);

        var totalDamage = this._calculateDamage(power, mitigation);

        //Process all the other effects of the action
        //this._damageEffect(totalDamage);
        this._changeProperty(this.targetCharacter, {hit_points: -totalDamage});

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": this.slackChannel,
            "text": (this.actionCharacter.props.name + " launches bolts of arcane energy which strike " + this.targetCharacter.props.name + " for " + totalDamage + " points of damage!")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);
    }
}

class QuickStrike extends BaseAttack {
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
        super(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
    }

    initiate() {
        this.channelActionFailMessage = (this.actionCharacter.props.name + " attempts a Quick Strike, but stumbles!");
        this.channelActionAvoidedMessage = (this.actionCharacter.props.name + " lunges forward for a Quick Strike but  " + this.targetCharacter.props.name + " evades the attack!");

        //BaseAction
        //skill check: this.baseSuccessChance + modifier
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            console.log('Skill FAILED!');
            return this.playerActionFailedMessage
        }

        //Evasion check
        //Arguments: accuracyModifier, avoidModifier
        if (this._avoidCheck(0, 0) === false) {
            console.log('Target evaded!');
            return this.playerActionAvoidedMessage
        }

        var power = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);

        var mitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);

        var totalDamage = this._calculateDamage(power, mitigation);

        //Process all the other effects of the action
        //this._damageEffect(totalDamage);
        this._changeProperty(this.targetCharacter, {hit_points: -totalDamage});

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": this.slackChannel,
            "text": (this.actionCharacter.props.name + " lunges forward with a powerful strike and lands a crushing blow on " + this.targetCharacter.props.name + " for " + totalDamage + " points of damage!")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);
    }
}

class LifeTap extends BaseAttack {
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
        super(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        this.playerActionFailedMessage = "Your target resists your spell!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
    }

    initiate() {
        this.channelActionFailMessage = (this.actionCharacter.props.name + " attempts to case Life Tap, but the spell fizzles away!");
        this.channelActionAvoidedMessage = (this.actionCharacter.props.name + " conjures a life tapping effect but " + this.targetCharacter.props.name + " resists the attack!")

        //BaseAction
        //skill check: this.baseSuccessChance + modifier
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            console.log('Skill FAILED!');
            return this.playerActionFailedMessage
        }

        //Evasion check
        //Arguments: accuracyModifier, avoidModifier
        if (this._avoidCheck(0, 0) === false) {
            console.log('Target evaded!');
            return this.playerActionAvoidedMessage
        }

        var power = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);

        var mitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);

        var totalDamage = this._calculateDamage(power, mitigation);

        //Process all the other effects of the action
        //this._damageEffect(totalDamage);
        this._changeProperty(this.targetCharacter, {hit_points: -totalDamage});
        this._changeProperty(this.actionCharacter, {hit_points: totalDamage});

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": this.slackChannel,
            "text": (this.actionCharacter.props.name + " conjures a life tapping effect and drains " + this.targetCharacter.props.name + " for " + totalDamage + " health!")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);
    }
}

//Defensive Stance is a stance that increases AC & lowers attack
//Static success chance
class DefensiveStance extends BaseModify {
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
        super(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";


        //Static base attributes based on the skill
        /*
        this.basePower = 8;
        this.baseSuccessChance = 1;
        this.baseMin = 0;
        this.baseMax = 0;
        this.baseChanceToAvoid = .01;

        this.evasionMessage = "Your target resists your spell!";*/
        //this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        //this.slackIcon = "https://www.heroesfire.com/images/wikibase/icon/abilities/drain-life.png";
        //this.slackUserName = "A mysterious voice";
    }

    initiate(){
        this.channelActionFailMessage = (this.actionCharacter.props.name + " attempts a Quick Strike, but stumbles!");
        //this.channelActionAvoidedMessage = (this.actionCharacter.props.name + " lunges forward for a Quick Strike but  " + this.targetCharacter.props.name + " evades the attack!");


        //this._setValues();

        //Action success check
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            console.log('Skill FAILED!');
            return this.playerActionFailedMessage
        }

        var power = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);

        //var totalDamage = this._calculateDamage(totalPower, this.damageMitigation);

        //Process all the other effects of the action

        var statsToModify = {
            modified_toughness: power,
            modified_strength: -power
        };

        this._applyEffect(this.targetCharacter, statsToModify, this.actionTaken);

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": ("#" + this.currentZone.props.channel),
            "text": (this.actionCharacter.props.name + " crouches and enters a defensive stance, increasing toughness by " + power + " while lowering strength by " + power + " !")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);
    }
}

/*
class BaseAction {
    constructor(actionCharacter, currentZone, currentMatch, actionTaken){

        this.actionCharacter = actionCharacter;
        this.currentZone = currentZone;
        this.currentMatch = currentMatch;
        this.actionTaken = actionTaken;

        this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        this.slackUserName = "A mysterious voice";
        this.slackChannel = ("#" + this.currentZone.props.channel);
    }

    _setValues(){
        console.log('BaseAction setvalues called');

        this.levelMultiplier = ( 1 + (this.actionCharacter.props.level / 100));
        //this.variablePower =  + this.actionCharacter.props.strength * this.levelMultiplier;
        //this.variableMin = this.variablePower + this.baseMin;
        //this.variableMax = this.variablePower + this.baseMax
    }

    _getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    _isSuccess(successChance){
        if ((this._getRandomIntInclusive(0, 100) >= ((1 - successChance) * 100))) {
            return(true)
        }

        return(false);
    }

    _isAvoided(avoidChance){
        console.log('called isAvoided');

        var diceRoll = (this._getRandomIntInclusive(0, 100));

        console.log('diceRoll: ', diceRoll);

        var targetResult = (avoidChance * 100);

        console.log('targetResult: ', targetResult);

        if (diceRoll <= targetResult) {
            return(true)
        }

        return(false);
    }

    _calculatePower(basePower, variableMin, variableMax, multiplier){

        console.log('called _calculatePower');
        console.log('_calculatePower, basePower: ', basePower);
        console.log('_calculatePower, variableMin: ', variableMin);
        console.log('_calculatePower, variableMax: ', variableMax);
        console.log('_calculatePower, multiplier: ', multiplier);

        var calculatedPower = (basePower + this._getRandomIntInclusive(Math.round(variableMin), Math.round(variableMax))) * multiplier

        console.log('calculatedPower: ', calculatedPower);
        return calculatedPower;
    }

    _addEffect(characterToModify, modifier){

    }
}


class BaseAttack extends BaseAction{
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
        super(actionCharacter, currentZone, currentMatch, actionTaken);

        this.targetCharacter = targetCharacter;
    }

    _setValues(){

        console.log('BaseAttack setvalues called');
        console.log('this.actionCharacter.props.level called: ', this.actionCharacter.props.level);
        console.log('this.actionCharacter.props.level strength: ', this.actionCharacter.props.strength);

        this.chanceToAvoid = this.baseChanceToAvoid + (this.targetCharacter.props.dexterity / 100);
        this.damageMitigation = (this.targetCharacter.props.toughness + this.targetCharacter.props.armor) / 10;

        super._setValues();
    }

    _calculateDamage(damage, mitigation){

        var totalDamage = damage - mitigation;

        if (totalDamage < 0) {
            return 0;
        }

        return totalDamage;
    }

    //Object of stat/modifier key/value pairs
    _changeProperty(characterToModify, modifiers){

        //Convert all keys into array
        var modifierKeys = Object.keys(modifiers);

        if (modifierKeys.length > 0) {
            modifierKeys.forEach( eachModifierKey =>{

                characterToModify.incrementProperty(eachModifierKey, modifiers[eachModifierKey]);
            })
        }
    }

    _applyEffect(characterToModify, modifiers, actionTaken){

        //Convert all keys into array
        var modifierKeys = Object.keys(modifiers);

        var modifierObject = {};

        if (modifierKeys.length > 0) {
            modifierKeys.forEach( eachModifierKey =>{
                modifierObject = Object.assign(modifierObject, {[eachModifierKey]: modifiers[eachModifierKey]});
            })
        }

        var endingTurn = this.currentMatch.props.number_turns + actionTaken.props.effect_duration;

        //If character has a effects array, add the action ID to it, else create an effects array and add to it
        if (characterToModify.props.effects){
            characterToModify.props.effects.push({
                action_id: actionTaken.id,
                end_turn: endingTurn,
                type: actionTaken.props.type,
                modifiers: modifierObject
            });
        } else {
            characterToModify.props.effects = [{
                action_id: actionTaken.id,
                end_turn: endingTurn,
                type: actionTaken.props.type,
                modifiers: modifierObject
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

        var effectsToRemove = characterToModify.props.effects[arrayIndex].modifiers;

        //Functionality from _changeProperty but with negative values
        var modifierKeys = Object.keys(effectsToRemove);

        if (modifierKeys.length > 0) {
            modifierKeys.forEach( eachModifierKey =>{

                characterToModify.incrementProperty(eachModifierKey, -(effectsToRemove[eachModifierKey]));
            })
        }

        characterToModify.props.effects.splice(arrayIndex, 1);
    }

    updateAction(){

        //Take the current actions
        //var currentActions = this.actionCharacter.props.actions;

        var actionKey = _.findKey(this.actionCharacter.props.actions, {'action_id': this.actionTaken.id});

        var actionID = this.actionCharacter.props.actions[actionKey].action_id;

        var newTurnAvailable = this.currentMatch.props.number_turns + this.actionTaken.props.cool_down;
        var newTurnUsed = this.currentMatch.props.number_turns;

        //actionsToUpdate[actionKey].turn_available = actionsToUpdate;
        this.actionCharacter.props.actions[actionKey].turn_available = newTurnAvailable;
        this.actionCharacter.props.actions[actionKey].turn_used = newTurnUsed;
    }
}
*/




//QuickStrike is a melee strength based attack
//Static success chance
/*
class QuickStrike extends BaseAttack {
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
        super(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken);

        //Static base attributes based on the skill
        this.basePower = 5;
        this.baseSuccessChance = .9;
        this.baseMin = 1;
        this.baseMax = 5;
        this.baseChanceToAvoid = .05;

        this.evasionMessage = "Your target turns your blade!";
        //this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        //this.slackUserName = "A mysterious voice";
    }

    initiate() {

        this._setValues();

        //Action success check
        //If failure, return a failure message and end
        if (this._isSuccess(this.baseSuccessChance) === false) {
            console.log('Skill FAILED!');

            //Alert the channel of the action
            var alertDetails = {
                "username": this.slackUserName,
                "icon_url": this.slackIcon,
                "channel": ("#" + this.currentZone.props.channel),
                "text": (this.actionCharacter.props.name + " attempts a Quick Strike, but stumbles!")
            };

            //Create a new slack alert object
            var channelAlert = new Slack(alertDetails);

            //Send alert to slack
            channelAlert.sendToSlack(this.params);

            return ("Your action FAILS")
        }

        //Evasion check
        if (this._isAvoided(this.chanceToAvoid) === true) {
            console.log('Target evaded!');

            //Alert the channel of the action
            var alertDetails = {
                "username": this.slackUserName,
                "icon_url": this.slackIcon,
                "channel": ("#" + this.currentZone.props.channel),
                "text": (this.actionCharacter.props.name + " lunges forward for a Quick Strike but  " + this.targetCharacter.props.name + " evades the attack!")
            };

            //Create a new slack alert object
            var channelAlert = new Slack(alertDetails);

            //Send alert to slack
            channelAlert.sendToSlack(this.params);

            return (this.evasionMessage)
        }

        var totalPower = this._calculatePower(this.basePower, this.baseMin, this.baseMax, this.levelMultiplier);

        var totalDamage = this._calculateDamage(totalPower, this.damageMitigation);

        //Process all the other effects of the action
        //this._damageEffect(totalDamage);
        this._changeProperty(this.targetCharacter, {hit_points: -totalDamage});

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": ("#" + this.currentZone.props.channel),
            "text": (this.actionCharacter.props.name + " lunges forward with a powerful strike and lands a crushing blow on " + this.targetCharacter.props.name + " for " + totalDamage + " points of damage!")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);
    }
}*/

//LifeTap is a spell
//Static success chance
/*
class LipeTap extends BaseAttack {
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
        super(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken);

        //Static base attributes based on the skill
        this.basePower = 4;
        this.baseSuccessChance = .8;
        this.baseMin = 1;
        this.baseMax = 5;
        this.baseChanceToAvoid = .01;

        this.evasionMessage = "Your target resists your spell!";
        //this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        //this.slackIcon = "https://www.heroesfire.com/images/wikibase/icon/abilities/drain-life.png";
        //this.slackUserName = "A mysterious voice";
    }

    initiate(){

        this._setValues();

        //Action success check
        //If failure, return a failure message and end
        if (this._isSuccess(this.baseSuccessChance) === false) {
            console.log('Skill FAILED!');

            //Alert the channel of the action
            var alertDetails = {
                "username": this.slackUserName,
                "icon_url": this.slackIcon,
                "channel": ("#" + this.currentZone.props.channel),
                "text": (this.actionCharacter.props.name + " attempts to cast Life Tap, but fails to conjure the spell!")
            };

            //Create a new slack alert object
            var channelAlert = new Slack(alertDetails);

            //Send alert to slack
            channelAlert.sendToSlack(this.params);

            return("Your action FAILS")
        }

        //Evasion check
        if (this._isAvoided(this.chanceToAvoid) === true){
            console.log('Target evaded!');

            //Alert the channel of the action
            var alertDetails = {
                "username": this.slackUserName,
                "icon_url": this.slackIcon,
                "channel": ("#" + this.currentZone.props.channel),
                "text": (this.actionCharacter.props.name + " conjures a life tapping effect but " + this.targetCharacter.props.name + " resists the attack!")
            };

            //Create a new slack alert object
            var channelAlert = new Slack(alertDetails);

            //Send alert to slack
            channelAlert.sendToSlack(this.params);

            return (this.evasionMessage)
        }

        var totalPower = this._calculatePower(this.basePower, this.baseMin, this.baseMax, this.levelMultiplier);

        var totalDamage = this._calculateDamage(totalPower, this.damageMitigation);

        //Process all the other effects of the action
        //this._damageEffect(totalDamage);
        this._changeProperty(this.targetCharacter, {hit_points: -totalDamage});
        this._changeProperty(this.actionCharacter, {hit_points: totalDamage});

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": ("#" + this.currentZone.props.channel),
            "text": (this.actionCharacter.props.name + " conjures a life tapping effect and drains " + this.targetCharacter.props.name + " for " + totalDamage + " health!")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);
    }
}*/

//Defensive Stance is a stance that increases AC & lowers attack
//Static success chance
/*
class DefensiveStance extends BaseAttack {
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
        super(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken);

        //Static base attributes based on the skill
        this.basePower = 8;
        this.baseSuccessChance = 1;
        this.baseMin = 0;
        this.baseMax = 0;
        this.baseChanceToAvoid = .01;

        this.evasionMessage = "Your target resists your spell!";
        //this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        //this.slackIcon = "https://www.heroesfire.com/images/wikibase/icon/abilities/drain-life.png";
        //this.slackUserName = "A mysterious voice";
    }

    initiate(){

        this._setValues();

        //Action success check
        //If failure, return a failure message and end
        if (this._isSuccess(this.baseSuccessChance) === false) {
            console.log('Skill FAILED!');

            //Alert the channel of the action
            var alertDetails = {
                "username": this.slackUserName,
                "icon_url": this.slackIcon,
                "channel": ("#" + this.currentZone.props.channel),
                "text": (this.actionCharacter.props.name + " attempts to enter a defensive stance, but stumbles!")
            };

            //Create a new slack alert object
            var channelAlert = new Slack(alertDetails);

            //Send alert to slack
            channelAlert.sendToSlack(this.params);

            return("Your action FAILS")
        }

        var totalPower = this._calculatePower(this.basePower, this.baseMin, this.baseMax, this.levelMultiplier);

        //var totalDamage = this._calculateDamage(totalPower, this.damageMitigation);

        //Process all the other effects of the action

        var statsToModify = {
            modified_toughness: totalPower,
            modified_strength: -totalPower
        };

        this._applyEffect(this.targetCharacter, statsToModify, this.actionTaken);
        //this._changeProperty(this.targetCharacter, statsToModify);
        //this._damageEffect(totalDamage);
        //this._healingEffect(totalDamage);

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": ("#" + this.currentZone.props.channel),
            "text": (this.actionCharacter.props.name + " crouches and enters a defensive stance, increasing toughness by " + totalPower + " while lowering strength by " + totalPower + " !")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);
    }
}*/

//Balanced Stance reverses the effects of any other stance
//Static success chance
class BalancedStance extends BaseAttack {
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
        super(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken);

        //Static base attributes based on the skill
        this.basePower = 8;
        this.baseSuccessChance = 1;
        this.baseMin = 0;
        this.baseMax = 0;
        this.baseChanceToAvoid = .01;

        this.evasionMessage = "Your target resists your spell!";
        //this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        //this.slackIcon = "https://www.heroesfire.com/images/wikibase/icon/abilities/drain-life.png";
        //this.slackUserName = "A mysterious voice";
    }

    initiate(){

        this._setValues();

        //Action success check
        //If failure, return a failure message and end
        if (this._isSuccess(this.baseSuccessChance) === false) {
            console.log('Skill FAILED!');

            //Alert the channel of the action
            var alertDetails = {
                "username": this.slackUserName,
                "icon_url": this.slackIcon,
                "channel": ("#" + this.currentZone.props.channel),
                "text": (this.actionCharacter.props.name + " attempts to enter a defensive stance, but stumbles!")
            };

            //Create a new slack alert object
            var channelAlert = new Slack(alertDetails);

            //Send alert to slack
            channelAlert.sendToSlack(this.params);

            return("Your action FAILS")
        }

        //var totalPower = this._calculatePower(this.basePower, this.baseMin, this.baseMax, this.levelMultiplier);

        //Lookup all actions that have the same type as the actionTaken
        var effectsOfSameType = _.filter(this.targetCharacter.props.effects, {type: this.actionTaken.props.type});

        console.log('effectsOfSameType: ', effectsOfSameType);

        effectsOfSameType.forEach( eachEffect =>{
            this._reverseEffect(this.targetCharacter, eachEffect.action_id);
        });

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": ("#" + this.currentZone.props.channel),
            "text": (this.actionCharacter.props.name + " enters a balanced combat stance!")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);
    }
}

//IntoShadow sets the character's is_visible property to zero.  This makes them unable to be targeted directly (can still be affected by area damage)
class IntoShadow extends BaseAttack {
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
        super(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken);

        //Static base attributes based on the skill
        this.basePower = 8;
        this.baseSuccessChance = .8;
        this.baseMin = 0;
        this.baseMax = 0;
        this.baseChanceToAvoid = .01;

        this.evasionMessage = "Your target resists your spell!";
        //this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        //this.slackIcon = "https://www.heroesfire.com/images/wikibase/icon/abilities/drain-life.png";
        //this.slackUserName = "A mysterious voice";
    }

    initiate(){

        this._setValues();

        //Action success check
        //If failure, return a failure message and end
        if (this._isSuccess(this.baseSuccessChance) === false) {
            console.log('Skill FAILED!');

            //Alert the channel of the action
            var alertDetails = {
                "username": this.slackUserName,
                "icon_url": this.slackIcon,
                "channel": ("#" + this.currentZone.props.channel),
                "text": (this.actionCharacter.props.name + " attempts to fade into the shadows but is noticed, action failed!")
            };

            //Create a new slack alert object
            var channelAlert = new Slack(alertDetails);

            //Send alert to slack
            channelAlert.sendToSlack(this.params);

            return("Your action FAILS")
        }

        //var totalPower = this._calculatePower(this.basePower, this.baseMin, this.baseMax, this.levelMultiplier);

        var statsToModify = {
            is_hidden: 1
        };

        this._applyEffect(this.targetCharacter, statsToModify, this.actionTaken);
        //this._changeProperty(this.targetCharacter, statsToModify);
        //this._damageEffect(totalDamage);
        //this._healingEffect(totalDamage);

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": ("#" + this.currentZone.props.channel),
            "text": (this.actionCharacter.props.name + " fades into the shadows!")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);
    }
}

//Backstab does significant damage, but is only available if the character is hidden.  Using breaks hiding
class Backstab extends BaseAttack {
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
        super(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken);

        //Static base attributes based on the skill
        this.basePower = 15;
        this.baseSuccessChance = 1;
        this.baseMin = 5;
        this.baseMax = 10;
        this.baseChanceToAvoid = .01;

        this.evasionMessage = "Your target resists your spell!";
        //this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        //this.slackIcon = "https://www.heroesfire.com/images/wikibase/icon/abilities/drain-life.png";
        //this.slackUserName = "A mysterious voice";
    }

    initiate(){

        this._setValues();

        //Action success check
        //If failure, return a failure message and end
        if (this._isSuccess(this.baseSuccessChance) === false) {
            console.log('Skill FAILED!');

            //Alert the channel of the action
            var alertDetails = {
                "username": this.slackUserName,
                "icon_url": this.slackIcon,
                "channel": ("#" + this.currentZone.props.channel),
                "text": (this.actionCharacter.props.name + " attempts to enter a defensive stance, but stumbles!")
            };

            //Create a new slack alert object
            var channelAlert = new Slack(alertDetails);

            //Send alert to slack
            channelAlert.sendToSlack(this.params);

            return("Your action FAILS")
        }

        //Evasion check
        if (this._isAvoided(this.chanceToAvoid) === true) {
            console.log('Target evaded!');

            //Alert the channel of the action
            var alertDetails = {
                "username": this.slackUserName,
                "icon_url": this.slackIcon,
                "channel": ("#" + this.currentZone.props.channel),
                "text": (this.actionCharacter.props.name + " lunges forward for a Quick Strike but  " + this.targetCharacter.props.name + " evades the attack!")
            };

            //Create a new slack alert object
            var channelAlert = new Slack(alertDetails);

            //Send alert to slack
            channelAlert.sendToSlack(this.params);

            return (this.evasionMessage)
        }

        var totalPower = this._calculatePower(this.basePower, this.baseMin, this.baseMax, this.levelMultiplier);

        var totalDamage = this._calculateDamage(totalPower, this.damageMitigation);
        
        this._changeProperty(this.targetCharacter, {hit_points: -totalDamage});

        var characterEffects = this.actionCharacter.props.effects;

        console.log('characterEffects: ', characterEffects);

        var hidingEffects = this.actionCharacter.props.effects.filter( eachEffect =>{
            return eachEffect.modifiers.is_hidden === 1
        });

        console.log('effectsOfSameType: ', hidingEffects);

        hidingEffects.forEach( eachEffect =>{
            this._reverseEffect(this.actionCharacter, eachEffect.action_id);
        });

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": ("#" + this.currentZone.props.channel),
            "text": (this.actionCharacter.props.name + " emerges from the shadows and backstabs " + this.targetCharacter.props.name + " for " + totalDamage + " points of damage!")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);
    }
}

module.exports = {
    QuickStrike: QuickStrike,
    LifeTap: LifeTap,
    DefensiveStance: DefensiveStance,
    BalancedStance: BalancedStance,
    IntoShadow: IntoShadow,
    Backstab: Backstab,
    ArcaneBolt: ArcaneBolt
};
