
const Slack = require('../../../libraries/slack').Alert;
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

        this.playerActionFailedMessage = "Your target resists your spell!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
    }

    initiate() {
        this.channelActionFailMessage = (this.actionCharacter.props.name + " attempts to case Life Tap, but the spell fizzles away!");
        this.channelActionAvoidedMessage = (this.actionCharacter.props.name + " conjures a life tapping effect but " + this.targetCharacter.props.name + " resists the attack!")

        //BaseAction
        //skill check: this.baseSuccessChance + modifier
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            console.log('Skill FAILED!');
            return this.playerActionFailedMessage
        }

        //Evasion check
        //Arguments: accuracyModifier, avoidModifier
        if (this._avoidCheck(0, 0) === false) {
            console.log('Target evaded!');
            return this.playerActionAvoidedMessage
        }

        var power = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);

        var mitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);

        var totalDamage = this._calculateDamage(power, mitigation);

        //Process all the other effects of the action
        //this._damageEffect(totalDamage);
        this._changeProperty(this.targetCharacter, {hit_points: -totalDamage});
        this._changeProperty(this.actionCharacter, {hit_points: totalDamage});

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": this.slackChannel,
            "text": (this.actionCharacter.props.name + " conjures a life tapping effect and drains " + this.targetCharacter.props.name + " for " + totalDamage + " health!")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);

        return '';
    }
}


module.exports = {
    LifeTap
};