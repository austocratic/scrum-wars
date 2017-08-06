'use strict';

var Slack = require('../libraries/slack').Alert;
var _ = require('lodash');


class BaseAction {
    constructor(actionCharacter, currentZone, currentMatch, actionTaken){

        this.actionCharacter = actionCharacter;
        this.currentZone = currentZone;
        this.currentMatch = currentMatch;
        this.actionTaken = actionTaken;
    }

    _setValues(){
        console.log('BaseAction setvalues called');

        this.levelMultiplier = ( 1 + (this.actionCharacter.props.level / 100));
        this.variablePower =  + this.actionCharacter.props.strength * this.levelMultiplier;
        this.variableMin = this.variablePower + this.baseMin;
        this.variableMax = this.variablePower + this.baseMax
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

    _calculatePower(basePower, variableMin, variableMax){

        console.log('called _calculatePower');
        console.log('_calculatePower, basePower: ', basePower);
        console.log('_calculatePower, variableMin: ', variableMin);
        console.log('_calculatePower, variableMax: ', variableMax);

        var calculatedPower = basePower + this._getRandomIntInclusive(Math.round(variableMin), Math.round(variableMax))

        console.log('calculatedPower: ', calculatedPower);
        return calculatedPower;
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

    //Increment damage and return the amount damaged
    /* TO DELETE
    _damageEffect(totalDamage){
        this.targetCharacter.incrementProperty('hit_points', (-1 * totalDamage));
    }

    _healingEffect(totalHealing){
        this.actionCharacter.incrementProperty('hit_points', (1 * totalHealing));
    }*/

    //Object of stat/modifier key/value pairs
    _modifierEffect(characterToModify, modifier){

        //Convert all keys into array
        var modifierKeys = Object.keys(modifier);

        if (modifierKeys.length > 0) {
            modifierKeys.forEach( eachModifierKey =>{

                console.log('Modifying ' + eachModifierKey + ' by ', modifier[eachModifierKey]);
                
                console.log('characterToModify: ', characterToModify);

                characterToModify.incrementProperty(eachModifierKey, modifier[eachModifierKey]);
            })
        }
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

//QuickStrike is a melee strength based attack
//Static success chance
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
        this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        this.slackUserName = "A mysterious voice";
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

        var totalPower = this._calculatePower(this.basePower, this.variableMin, this.variableMax);

        var totalDamage = this._calculateDamage(totalPower, this.damageMitigation);

        //Process all the other effects of the action
        //this._damageEffect(totalDamage);
        this._modifierEffect(this.targetCharacter, {hit_points: -totalDamage});

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
}

//LifeTap is a spell
//Static success chance
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
        this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        //this.slackIcon = "https://www.heroesfire.com/images/wikibase/icon/abilities/drain-life.png";
        this.slackUserName = "A mysterious voice";
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

        var totalPower = this._calculatePower(this.basePower, this.variableMin, this.variableMax);

        var totalDamage = this._calculateDamage(totalPower, this.damageMitigation);

        //Process all the other effects of the action
        //this._damageEffect(totalDamage);
        this._modifierEffect(this.targetCharacter, {hit_points: -totalDamage});
        this._modifierEffect(this.actionCharacter, {hit_points: totalDamage});

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
}

//Defensive Stance is a stance that increases AC & lowers attack
//Static success chance
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
        this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        //this.slackIcon = "https://www.heroesfire.com/images/wikibase/icon/abilities/drain-life.png";
        this.slackUserName = "A mysterious voice";
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

        var totalPower = this._calculatePower(this.basePower, this.variableMin, this.variableMax);

        //var totalDamage = this._calculateDamage(totalPower, this.damageMitigation);

        //Process all the other effects of the action

        var statsToModify = {
            modified_toughness: totalPower,
            modified_strength: -totalPower
        };

        this._modifierEffect(this.targetCharacter, statsToModify);
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
}



module.exports = {
    QuickStrike: QuickStrike,
    LipeTap: LipeTap,
    DefensiveStance: DefensiveStance
};
