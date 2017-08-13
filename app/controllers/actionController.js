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

    _applyEffect(characterToModify, modifiers, actionTaken){

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

        var endingTurn = this.currentMatch.props.number_turns + actionTaken.props.effect_duration;

        //console.log('Modifier object: ', modifierObject);

        //console.log('modifiers passed in: ', modifiers);

        //If character has a effects array, add the action ID to it, else create an effects array and add to it
        if (characterToModify.props.effects){
            characterToModify.props.effects.push({
                action_id: actionTaken.id,
                end_turn: endingTurn,
                type: actionTaken.props.type,
                modifiers: modifiers
                //modifiers: modifierObject
            });
        } else {
            characterToModify.props.effects = [{
                action_id: actionTaken.id,
                end_turn: endingTurn,
                type: actionTaken.props.type,
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
                console.log('eachModifierKey: ', eachModifierKey);

                var nestedProperty = modifiersToRemove[eachModifierKey];

                console.log('eachModifierKeyObject: ', nestedProperty);

                var nestedKeys = Object.keys(nestedProperty);

                console.log('nestedKeys: ', nestedKeys);

            })
        }


        //Functionality from _changeProperty but with negative values
        /*
        var modifierKeys = Object.keys(effectsToRemove);

        if (modifierKeys.length > 0) {
            modifierKeys.forEach( eachModifierKey =>{

                characterToModify.incrementProperty(eachModifierKey, -(effectsToRemove[eachModifierKey]));
            })
        }*/

        //Remove effect
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

    _reverseEffectsOfType(character, effectType){

        var characterEffects = character.props.effects;

        //Lookup all actions that have the same type as the actionTaken
        var effectsOfSameType = _.filter(characterEffects, {type: effectType});

        console.log('effectsOfSameType: ', effectsOfSameType);

        effectsOfSameType.forEach( eachEffect =>{
            this._reverseEffect(this.targetCharacter, eachEffect.action_id);
        });
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

//ArcaneBolt is a spell that deals damage to a single target
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
        this.basePower = 4;
        this.baseMitigation = 1;
        this.baseMin = 0;
        this.baseMax = 4;

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

        this.baseSuccessChance = 1; //% change of success
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 4;
        this.baseMitigation = 1;
        this.baseMin = 0;
        this.baseMax = 0;

        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
    }

    initiate(){
        this.channelActionFailMessage = (this.actionCharacter.props.name + " attempts a defensive stance, but stumbles!");

        //Action success check
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            console.log('Skill FAILED!');
            return this.playerActionFailedMessage
        }

        var power = this._calculateStrength(this.basePower, this.actionCharacter.props.level, this.baseMin, this.baseMax);

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

//Balanced Stance is a stance that removes other stances (reverses the effects of stances)
//Static success chance
class BalancedStance extends BaseModify {
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

    initiate(){
        this.channelActionFailMessage = (this.actionCharacter.props.name + " attempts a balance stance, but stumbles!");

        //Action success check
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            console.log('Skill FAILED!');
            return this.playerActionFailedMessage
        }

        this._reverseEffectsOfType(this.targetCharacter, this.actionTaken.props.type);

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
class IntoShadow extends BaseModify {
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
        super(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        this.playerActionFailedMessage = "You fail to enter the shadows!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
    }

    initiate(){
        this.channelActionFailMessage = (this.actionCharacter.props.name + " attempts to fade into the shadows but is noticed, action failed!")

        //Action success check
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            console.log('Skill FAILED!');
            return this.playerActionFailedMessage
        }

        //var totalPower = this._calculatePower(this.basePower, this.baseMin, this.baseMax, this.levelMultiplier);

        var statsToModify = {
            is_hidden: 1,
            actionsTest: {
                "-Kr3hnITyH9ZKx3VuZah": {
                    is_available: 1
                }
            }
        };

        this._applyEffect(this.targetCharacter, statsToModify, this.actionTaken);

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

        this.baseSuccessChance = .8;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 2;
        this.basePower = 10;
        this.baseMitigation = 1;
        this.baseMin = 3;
        this.baseMax = 8;

        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";

    }

    initiate(){
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

        this._changeProperty(this.targetCharacter, {hit_points: -totalDamage});

        console.log('actionCharacter.props: ', this.actionCharacter.props);

        var characterEffects = this.actionCharacter.props.effects;

        console.log('characterEffects: ', characterEffects);

        //Find all currently applied effects that change the targets is_hidden property
        var hidingEffects = this.actionCharacter.props.effects.filter( eachEffect =>{
            return eachEffect.modifiers.is_hidden === 1
        });

        console.log('effectsOfSameType: ', hidingEffects);

        //Reverse all effects that change is_hidden property
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
