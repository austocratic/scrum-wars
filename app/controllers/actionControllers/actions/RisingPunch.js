'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

class RisingPunch extends BaseAction {
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

        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a *Rising Punch* but stumbles!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} strikes with a *Rising Punch* but ${this.targetCharacter.props.name} blocks the blow!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} strikes ${this.targetCharacter.props.name} with a *Rising Punch* for ${this.calculatedDamage} points of damage!`;
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
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

                //Generate vigor, if action has no vigor_generated prop, adjust by 0
                let vigorGenerated = this.actionTaken.props.vigor_generated ? this.actionTaken.props.vigor_generated : 0;
                this.actionCharacter.incrementProperty('vigor_points', vigorGenerated);

                return {
                    status: 'complete',
                    damageDealt: [{
                        targetID: this.targetCharacter.id,
                        range: this.actionTaken.props.range,
                        damageAmount: this.calculatedDamage
                    }]};

                break;

            default:
                return this._getDefaultProcessResponse();
                break;
        }
    }
}

module.exports = {
    RisingPunch
};