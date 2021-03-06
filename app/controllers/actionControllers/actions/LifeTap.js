'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

class LifeTap extends BaseAction {
    constructor(gameObjects, actionCharacter) {
        super(gameObjects, actionCharacter);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;

        this.bonusDamage = this.actionCharacter.props.level;
        this.calculatedDamage = this._calculateMagic(this.actionTaken.props.damage_multiplier, this.bonusDamage);
        console.log(`${this.actionTaken.props.name} calculated damage of: ${this.calculatedDamage}`);

        //Alerts & Messages
        //this.playerActionFailedMessage = "Your target resists your spell!";
        //this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts to cast Life Tap, but the spell fizzles away!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} conjures a life tapping effect but ${this.targetCharacter.props.name} resists the attack!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} conjures a life tapping effect and drains ${this.targetCharacter.props.name} for ${this.calculatedDamage} health!`;
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):
                if (this._resistanceCheck(this.targetCharacter, this.actionCharacter.props.level, this.targetCharacter.props.level) === false) {
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
                this.actionCharacter.incrementProperty('hit_points', this.calculatedDamage);

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
    LifeTap
};