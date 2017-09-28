
const slack = require('../../../libraries/slack');
const BaseAttack = require('./../baseActions/BaseAttack').BaseAttack;


//ArcaneBolt is a spell that deals damage to a single target
class ArcaneBolt extends BaseAttack {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;
        
        //Alerts & Messages
        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} bolts of arcane energy streak from ${this.actionCharacter.props.name}'s fingers, but ${this.targetCharacter.props.name} resists the bolt's damage!`;
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts to conjure an Arcane Bolt, but the spell fizzles away!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} launches bolts of arcane energy which strike ${this.targetCharacter.props.name} for ${this.calculatedDamage} points of damage!`;

        //Score used as the total damage dealt
        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        //Score used to reduce the total damage dealt
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        //Total damage to be dealt if not avoided, resisted, ect.
        this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);
    }

    initiate() {

        //Base Slack message Details
        let slackPayload = {
            "username": this.actionCharacter.props.name,
            "icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
            "channel": this.slackChannel,
            "text": this.channelActionSuccessMessage
        };

        //BaseAction
        //skill check: this.baseSuccessChance + modifier
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            slackPayload.text = this.channelActionFailMessage;
            slack.sendMessage(slackPayload);
            return this.playerActionFailedMessage
        }

        //Evasion check
        //Arguments: accuracyModifier, avoidModifier
        if (this._avoidCheck(0, 0) === false) {
            slackPayload.text = this.channelActionAvoidedMessage;
            slack.sendMessage(slackPayload);
            return this.playerActionAvoidedMessage
        }

        //Process all the other effects of the action
        this._changeProperty(this.targetCharacter, {hit_points: -this.calculatedDamage});

        slackPayload.text = this.channelActionSuccessMessage;
        slack.sendMessage(slackPayload);

        return '';
    }
}


module.exports = {
    ArcaneBolt
};