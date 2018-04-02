'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

class Whirlwind extends BaseAction {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        //AOE Specific attributes
        this.maxTargetsAffected = 3;

        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        //this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

        //Alerts & Messages
        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a Quick Strike, but stumbles!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} lunges forward for a Quick Strike but ${this.targetCharacter.props.name} evades the attack!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} lunges forward with a powerful strike and lands a crushing blow on ${this.targetCharacter.props.name} for ${this.calculatedDamage} points of damage!`;
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):
                this.defaultActionPayload.attachments[0].text = `${this.actionCharacter.props.name} enters a berserk rage becoming a *whirlwind* of blades`;
                slack.sendMessage(this.defaultActionPayload);
                break;
            case (turn <= 1):
                this.defaultActionPayload.attachments[0].text = `${this.actionCharacter.props.name}'s *whirling blades* lash out`;
                slack.sendMessage(this.defaultActionPayload);

                let targets = this._getUniqueRandomTarget(this.maxTargetsAffected);

                const processOnSingleTarget = (singleTarget) => {

                    //Evasion check
                    //Arguments: accuracyModifier, avoidModifier
                    if (this._avoidCheck(0, 0) === false) {
                        this.defaultActionPayload.attachments[0].text = `${singleTarget.props.name} evades ${this.actionCharacter.props.name}'s whirling blades!`;
                        slack.sendMessage(this.defaultActionPayload);
                        return;
                    }

                    let calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

                    //Process damage & Interrupts
                    this._processDamage(singleTarget, calculatedDamage);

                    //Build a new message based on the randomTarget
                    setTimeout( () => {
                        this.defaultActionPayload.attachments[0].text = `${this.actionCharacter.props.name}'s whirling blades strike ${singleTarget.props.name} for ${calculatedDamage} points of damage!`;
                        slack.sendMessage(this.defaultActionPayload);
                    }, 500);

                };

                //Iterate through targets processing
                for(const target of targets){
                    console.log('keep processing!');

                    processOnSingleTarget(target, 1);
                }

                break;
            case (turn >= 2):
                this._deleteActionInQueue();
                break;
        }
    }
}

/* Structure to add additional property validations
 QuickStrike.validations = [
 ...BaseAttack.validations,
 'playerCharacter',
 'targetCharacter',
 'requestZone',
 'currentMatch',
 'actionTaken'
 ];*/


module.exports = {
    Whirlwind
};