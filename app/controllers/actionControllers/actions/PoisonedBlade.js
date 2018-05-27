'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

class PoisonedBlade extends BaseAction {
    constructor(gameObjects, actionCharacter) {
        super(gameObjects, actionCharacter);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;

        this.bonusDamage = this.actionCharacter.props.level;
        this.calculatedDamage = this._calculateMelee(this.actionTaken.props.damage_multiplier, this.bonusDamage);
        console.log(`${this.actionTaken.props.name} calculated damage of: ${this.calculatedDamage}`);

        //Alerts & Messages
        this.playerActionFailedMessage = "You lunge towards your enemy but stumble";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";

        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a poisonous strike, but stumbles!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} strikes out with poisonous blades but ${this.targetCharacter.props.name} dodges the attack!`;
        this.channelActionSuccessMessage =
        `${this.actionCharacter.props.name} slices ${this.targetCharacter.props.name} for ${this.calculatedDamage} damage!
        \n${this.actionCharacter.props.name}'s blade releases a noxious poison!`;

        //Modifiers to apply on action success - empty because we apply an effect, but this effect has no modifiers
        this.statsToModify = {
        };
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):
                if (this._avoidCheck(0, 0) === false) {
                    this.defaultActionPayload.attachments[0].text = this.channelActionAvoidedMessage;
                    slack.sendMessage(this.defaultActionPayload);
                    return;
                }

                this.defaultActionPayload.attachments[0].text = this.channelActionSuccessMessage;
                this.defaultActionPayload.attachments[0].thumb_url = this.game.baseURL + this.game.thumbImagePath + 'green-cloud.gif';
                slack.sendMessage(this.defaultActionPayload);

                //Process damage & Interrupts
                this._processDamage(this.targetCharacter, this.calculatedDamage);

                //Apply the effect
                this._applyEffect(this.targetCharacter, this.statsToModify);

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
    PoisonedBlade
};