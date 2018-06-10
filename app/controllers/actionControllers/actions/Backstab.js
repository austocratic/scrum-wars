'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

class Backstab extends BaseAction {
    constructor(gameObjects, actionCharacter) {
        super(gameObjects, actionCharacter);

        this.baseSuccessChance = .8;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 2;

        this.bonusDamage = (this.actionCharacter.props.level * 2);
        this.calculatedDamage = this._calculateMelee(this.actionTaken.props.damage_multiplier, this.bonusDamage);
        console.log(`${this.actionTaken.props.name} calculated damage of: ${this.calculatedDamage}`);
        
        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a Backstab, but stumbles!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} lunges forward for a Quick Strike but ${this.targetCharacter.props.name} evades the attack!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} emerges from the shadows and backstabs ${this.targetCharacter.props.name} for ${this.calculatedDamage} points of damage!`;
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):
                if (this._dodgeCheck(this.targetCharacter, 0, 0) === false) {
                    this.defaultActionPayload.attachments[0].text = this.channelActionAvoidedMessage;
                    slack.sendMessage(this.defaultActionPayload);
                    return {
                        status: 'complete',
                        damageDealt: [{
                            targetID: this.targetCharacter.id,
                            range: this.actionTaken.props.range,
                            damageAmount: 0
                        }]};
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
    Backstab
};