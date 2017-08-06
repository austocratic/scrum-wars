'use strict';

var Slack = require('../libraries/slack').Alert;
var _ = require('lodash');

//Utility functions

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Basic attack
//1. skill check
//2. calculate skill power
//3. avoidance check
//4. calculate mitigation
//5. compute results
class BaseAttack {
    constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {

        this.actionCharacter = actionCharacter;
        this.targetCharacter = targetCharacter;
        this.currentZone = currentZone;
        this.currentMatch = currentMatch;
        this.actionTaken = actionTaken;
        
    }

    _isSuccess(successChance){
        if ((getRandomIntInclusive(0, 100) >= ((1 - successChance) * 100))) {
            return(true)
        }

        return(false);
    }

    _calculatePower(basePower, variableMin, variableMax){

        console.log('calculatePower, basePower: ', basePower);
        console.log('calculatePower, variableMin: ', variableMin);
        console.log('calculatePower, variableMax: ', variableMax);

        return basePower + getRandomIntInclusive(Math.round(variableMin), Math.round(variableMax))
    }

    _isAvoided(avoidChance){
        console.log('called isAvoided');

        var diceRoll = (getRandomIntInclusive(0, 100));

        console.log('diceRoll: ', diceRoll);

        var targetResult = (avoidChance * 100);

        console.log('targetResult: ', targetResult);

        if (diceRoll <= targetResult) {
            return(true)
        }

        return(false);
    }

    _calculateDamage(damage, mitigation){

        var totalDamage = damage - mitigation;
        
        if (totalDamage < 0) {
            return 0;
        }
        
        return totalDamage;
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
    }

    setValues(){

        console.log('called setValues');
        console.log('called this.actionCharacter: ', this.actionCharacter);
        
        console.log('actionCharacter.props.strength: ', this.actionCharacter.props.strength);
        console.log('actionCharacter.props.level: ', this.actionCharacter.props.level);

        //Variable attributes
        this.levelMultiplier = ( 1 + (this.actionCharacter.props.level / 100));
        this.variablePower =  + this.actionCharacter.props.strength * this.levelMultiplier;
        this.variableMin = this.variablePower + this.baseMin;
        this.variableMax = this.variablePower + this.baseMax;
    }
    
    initiate(){

        this.setValues();

        //1.) Action success check
        //If failure, return a failure message and end
        if (this._isSuccess(this.baseSuccessChance) === false) {
            console.log('Skill FAILED!');
            return("Your action FAILS")
        }

        //Process all the other effects of the action
        var resultText = this.damageEffect();
        
        return resultText;
    }

    damageEffect(){

        this.totalPower = this._calculatePower(this.basePower, this.variableMin, this.variableMax);

        this.chanceToAvoid = this.baseChanceToAvoid + (this.targetCharacter.props.dexterity / 100);

        //3.) Evasion check
        if (this._isAvoided(this.chanceToAvoid) === true){
            console.log('Target evaded!');
            return (this.evasionMessage)
        }

        this.damageMitigation = (this.targetCharacter.props.toughness + this.targetCharacter.props.armor) / 10;

        console.log('totalPower: ', this.totalPower);
        console.log('damageMitigation: ', this.damageMitigation);

        //4.) Calculate the results
        var totalDamage = this._calculateDamage(this.totalPower, this.damageMitigation);

        //reduce target ID.hit_points
        this.targetCharacter.incrementProperty('hit_points', (-1 * totalDamage));

        //return this.actionCharacter.props.name + " lunges forward with a powerful strike and lands a crushing blow on " + this.targetCharacter.props.name + " for " + totalDamage + " points of damage!"

        //Update the action's available turn



        //Alert the channel of the action
        var alertDetails = {
            "username": "A mysterious voice",
            "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
            "channel": ("#" + this.currentZone.props.channel),
            "text": (this.actionCharacter.props.name + " lunges forward with a powerful strike and lands a crushing blow on " + this.targetCharacter.props.name + " for " + totalDamage + " points of damage!")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params)

    }
}




module.exports = {
    QuickStrike: QuickStrike
};
