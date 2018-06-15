'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

class StingingBees extends BaseAction {
    constructor(gameObjects, actionCharacter) {
        super(gameObjects, actionCharacter);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;

        this.bonusDamage = this.actionCharacter.props.level;
        //this.calculatedDamage = this._calculateMelee(this.actionTaken.props.damage_multiplier, this.bonusDamage);
        //console.log(`${this.actionTaken.props.name} calculated damage of: ${this.calculatedDamage}`);

        //Alerts & Messages
        //this.playerActionFailedMessage = "You lunge towards your enemy but stumble";
        //this.playerActionAvoidedMessage = "Your target avoids your attack!";

        //this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} strikes out with poisonous blades but ${this.targetCharacter.props.name} dodges the attack!`;
        this.channelActionFailMessage = `${this.actionCharacter.props.name} conjure a swarm of stinging bees, but the spell fizzles away!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} conjures a swarm of stinging bees which swarm around ${this.targetCharacter.props.name}!`;

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
                if (this._resistanceCheck(this.targetCharacter, this.actionCharacter.props.level, this.targetCharacter.props.level) === false) {
                    this.defaultActionPayload.attachments[0].text = this.channelActionAvoidedMessage;
                    this.defaultActionPayload.attachments[0].thumb_url = this.game.baseURL + this.game.thumbImagePath + this.actionTaken.props.image_id + '.png';
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
                this.defaultActionPayload.attachments[0].thumb_url = this.game.baseURL + this.game.thumbImagePath + this.actionTaken.props.image_id + '.png';
                slack.sendMessage(this.defaultActionPayload);

                return {
                    status: 'ongoing',
                    damageDealt: [{
                        targetID: this.targetCharacter.id,
                        range: this.actionTaken.props.range,
                        damageAmount: 0
                    }]
                };

                break;
            case (turn >= 1 && turn <= 4):

                let ongoingDamageAmount = this._calculateDamage(this.actionTaken.props.ongoing_damage, this.actionTaken.props.ongoing_damage, this.actionTaken.props.ongoing_damage, 1, 1, 0);

                this.defaultActionPayload.attachments = [{
                    "text": `${this.targetCharacter.props.name} is stung from all directions by a swarm of bees for ${ongoingDamageAmount} damage!`,
                    "thumb_url": this.game.baseURL + this.game.skillImagePath + this.actionTaken.props.image_id + '.png',
                    "fields": [
                        {
                            "title": "Damage Type",
                            "value": "Nature",
                            "short": true
                        },
                        {
                            "title": "Damage Amount",
                            "value": ongoingDamageAmount,
                            "short": true
                        }
                    ]
                }];

                slack.sendMessage(this.defaultActionPayload);

                this._processDamage(this.targetCharacter, ongoingDamageAmount);

                return {
                    targetID: this.targetCharacter.id,
                    range: this.actionTaken.props.range,
                    damageAmount: [{
                        targetID: this.targetCharacter.id,
                        range: this.actionTaken.props.range,
                        damageAmount: ongoingDamageAmount
                    }]
                };

                break;
            default:
                this.defaultActionPayload.attachments[0].text = `${this.actionCharacter.props.name}'s *stinging bees* swarm away from ${this.targetCharacter.props.name}!`;
                slack.sendMessage(this.defaultActionPayload);

                return this._getDefaultProcessResponse();
                break;
        }
    }
}

module.exports = {
    StingingBees
};