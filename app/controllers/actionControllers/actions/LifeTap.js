
const slack = require('../../../libraries/slack');
const BaseAttack = require('./../baseActions/BaseAttack').BaseAttack;


class LifeTap extends BaseAttack {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 4;
        this.baseMitigation = 1;
        this.baseMin = 0;
        this.baseMax = 4;

        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

        //Alerts & Messages
        this.playerActionFailedMessage = "Your target resists your spell!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts to cast Life Tap, but the spell fizzles away!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} conjures a life tapping effect but ${this.targetCharacter.props.name} resists the attack!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} conjures a life tapping effect and drains ${this.targetCharacter.props.name} for ${this.calculatedDamage} health!`;

        //Base Slack template
        this.slackPayload = {
            "username": this.actionCharacter.props.name,
            "icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
            "channel": this.slackChannel
        };
    }

    initiate() {

        //skill check
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            this.slackPayload.text = this.channelActionFailMessage;
            slack.sendMessage(this.slackPayload);
            return;
        }

        //Evasion check
        //Arguments: accuracyModifier, avoidModifier
        if (this._avoidCheck(0, 0) === false) {
            this.slackPayload.text = this.channelActionAvoidedMessage;
            slack.sendMessage(this.slackPayload);
            return;
        }

        //Process all the other effects of the action
        //this._changeProperty(this.targetCharacter, {hit_points: -this.calculatedDamage});
        this.targetCharacter.incrementProperty('health', -this.calculatedDamage);
        //this._changeProperty(this.actionCharacter, {hit_points: -this.calculatedDamage});
        this.actionCharacter.incrementProperty('health', this.calculatedDamage);

        this.slackPayload.text = this.channelActionSuccessMessage;
        slack.sendMessage(this.slackPayload);
    }
}

module.exports = {
    LifeTap
};