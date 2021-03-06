'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

class MinorHealing extends BaseAction {
    constructor(gameObjects, actionCharacter) {
        super(gameObjects, actionCharacter);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;

        this.bonusDamage = this.actionCharacter.props.level;
        this.healingAmount = this._calculateHealing();
        //this.calculatedDamage = this._calculateMagic(this.actionTaken.props.damage_multiplier, this.bonusDamage);
        console.log(`${this.actionTaken.props.name} calculated healing of: ${this.healingAmount}`);

        //Alerts & Messages
        //this.playerActionFailedMessage = "Your attack fails!";
        //this.playerActionAvoidedMessage = "Your target avoids your attack!";
        //this.channelActionAvoidedMessage = `Bolts of arcane energy streak from ${this.actionCharacter.props.name}'s fingers, but ${this.targetCharacter.props.name} resists the bolt's damage!`;
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts to conjure ${this.actionTaken.props.name}, but the spell fizzles away!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} conjures waves of healing light which surround ${this.targetCharacter.props.name} healing ${this.healingAmount} points of damage!`;
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):
                this.defaultActionPayload.attachments[0].text = this.channelActionSuccessMessage;
                this.defaultActionPayload.attachments[0].thumb_url = this.game.baseURL + this.game.thumbImagePath + this.actionTaken.props.image_id + '.gif';
                slack.sendMessage(this.defaultActionPayload);

                //Process damage & Interrupts
                this._processHealing(this.targetCharacter, this.healingAmount);

                return {
                    status: 'complete',
                    damageDealt: [{
                        targetID: this.targetCharacter.id,
                        range: this.actionTaken.props.range,
                        damageAmount: 0
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
    MinorHealing
};