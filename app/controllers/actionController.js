'use strict';

var Slack = require('../libraries/slack').Alert;

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
    constructor(actionCharacter, targetCharacter) {

        this.actionCharacter = actionCharacter;
        this.targetCharacter = targetCharacter;
        
    }

    _isSuccess(successChance){
        if ((getRandomIntInclusive(0, 100) >= ((1 - successChance) * 100))) {
            return(true)
        }

        return(false);
    }

    _calculatePower(basePower, variableMin, variableMax){
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
}

//QuickStrike is a melee strength based attack
//Static success chance
class QuickStrike extends BaseAttack {
    constructor(actionCharacter, targetCharacter) {
        super(actionCharacter, targetCharacter);

        //Static base attributes based on the skill
        this.basePower = 5;
        this.baseSuccessChance = .9;
        this.baseMin = 1;
        this.baseMax = 5;
        this.baseChanceToAvoid = .05;

        this.evasionMessage = "Your target turns your blade!";
    }

    setValues(){
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

        return this.actionCharacter.props.name + " lunges forward with a powerful strike and lands a crushing blow on " + this.targetCharacter.props.name + " for " + totalDamage + " points of damage!"
    }
}

//QuickStrike is a melee strength based attack
//Static success chance
class BrutalStrike extends BaseAttack {
    constructor(actionCharacter, targetCharacter) {
        super(actionCharacter, targetCharacter);

        //Static base attributes based on the skill
        this.basePower = 8;
        this.baseSuccessChance = .9;
        this.baseMin = 3;
        this.baseMax = 7;
        this.baseChanceToAvoid = .15;

        this.evasionMessage = "Your target dodges your brutal strike!";
    }

    setValues(){
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

        return this.actionCharacter.props.name + " lunges forward with a powerful strike and lands a crushing blow on " + this.targetCharacter.props.name + " for " + totalDamage + " points of damage!"
    }
}




module.exports = {
    QuickStrike: QuickStrike
};
