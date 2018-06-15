'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

class FistOfThunder extends BaseAction {
    constructor(gameObjects, actionCharacter) {
        super(gameObjects, actionCharacter);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;

        this.bonusDamage = this.actionCharacter.props.level;
        this.calculatedDamage = this._calculateMelee(this.actionTaken.props.damage_multiplier, this.bonusDamage);
        console.log(`${this.actionTaken.props.name} calculated damage of: ${this.calculatedDamage}`);

        //Alerts & Messages
        //this.playerActionFailedMessage = "Your attack fails!";
        //this.playerActionAvoidedMessage = "Your target avoids your attack!";

        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a strike with a *Thunderous Fist* but stumbles!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} expends vigor and unleashes a thunderous attack, but ${this.targetCharacter.props.name} avoids the *Fist of Thunder*`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} expends vigor and unleashes a thunderous attack, striking ${this.targetCharacter.props.name} with a *Fist of Thunder* for ${this.calculatedDamage} points of damage!`;
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        switch (true) {
            case (turn <= 0):
                //if (this._dodgeCheck(this.targetCharacter, 0, 0) === false) {
                if (!this._dodgeCheck(this.targetCharacter, 0, 0)) {
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
                    }]};

                break;

            default:
                return this._getDefaultProcessResponse();
                break;
        }
    }
}

module.exports = {
    FistOfThunder
};