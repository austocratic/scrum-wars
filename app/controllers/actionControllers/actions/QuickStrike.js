'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

class QuickStrike extends BaseAction {
    constructor(gameObjects, actionCharacter) {
        super(gameObjects, actionCharacter);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;

        this.bonusDamage = this.actionCharacter.props.level;
        this.calculatedDamage = this._calculateMelee(this.actionTaken.props.damage_multiplier, this.bonusDamage);
        console.log(`${this.actionTaken.props.name} calculated damage of: ${this.calculatedDamage}`);

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
        //console.log('DEBUG just called QuickStrike process() function');
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):
                if (this._dodgeCheck(this.targetCharacter, 0, 0) === false) {
                    this.defaultActionPayload.attachments[0].text = this.channelActionAvoidedMessage;
                    slack.sendMessage(this.defaultActionPayload);
                    return;
                }

                this.defaultActionPayload.attachments[0].text = this.channelActionSuccessMessage;
                slack.sendMessage(this.defaultActionPayload);

                //Process damage & Interrupts
                this._processDamage(this.targetCharacter, this.calculatedDamage);

                return {
                    status: 'complete',
                    damageDealt: [{
                        targetID: this.targetCharacter.id,
                        range: this.actionTaken.props.range,
                        damageAmount: this.calculatedDamage
                    }]
                };

                break;

            default:
                return this._getDefaultProcessResponse();
                break;
        }
    }
}

module.exports = {
    QuickStrike
};