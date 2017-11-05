
const slack = require('../../../libraries/slack');
const BaseAttack = require('./../baseActions/BaseAttack').BaseAttack;


class PoisonedBlade extends BaseAttack {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 3;
        this.baseMitigation = 1;
        this.baseMin = 0;
        this.baseMax = 3;

        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

        //Alerts & Messages
        this.playerActionFailedMessage = "You lunge towards your enemy but stumble";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a poisonous strike, but stumbles!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} strikes out with poisonous blades but ${this.targetCharacter.props.name} dodges the attack!`;
        this.channelActionSuccessMessage =
            `${this.actionCharacter.props.name} slices ${this.targetCharacter.props.name} for ${this.calculatedDamage} damage!
            ${this.actionCharacter.props.name}'s blade releases a noxious poison!`;

        //Base Slack template
        this.slackPayload = {
            "username": this.actionCharacter.props.name,
            "icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
            "channel": this.slackChannel
        };

        //Modifiers to apply on action success - empty because we apply an effect, but this effect has no modifiers
        this.statsToModify = {
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
        this.targetCharacter.incrementProperty('health', -this.calculatedDamage);
        
        //Apply the effect
        this._applyEffect(this.targetCharacter, this.statsToModify);

        //Alert the channel of the action
        this.slackPayload.text = this.channelActionSuccessMessage;
        slack.sendMessage(this.slackPayload);
    }
}

module.exports = {
    PoisonedBlade
};