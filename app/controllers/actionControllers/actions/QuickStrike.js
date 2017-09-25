
const Slack = require('../../../libraries/slack').Alert;
const BaseAttack = require('./../baseActions/BaseAttack').BaseAttack;

class QuickStrike extends BaseAttack {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
    }

    initiate() {
        this.channelActionFailMessage = (this.actionCharacter.props.name + " attempts a Quick Strike, but stumbles!");
        this.channelActionAvoidedMessage = (this.actionCharacter.props.name + " lunges forward for a Quick Strike but  " + this.targetCharacter.props.name + " evades the attack!");

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

        let power = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);

        let mitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);

        let totalDamage = this._calculateDamage(power, mitigation);

        //Process all the other effects of the action
        //this._damageEffect(totalDamage);
        this._changeProperty(this.targetCharacter, {hit_points: -totalDamage});

        //Alert the channel of the action
        let alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": this.slackChannel,
            "text": (this.actionCharacter.props.name + " lunges forward with a powerful strike and lands a crushing blow on " + this.targetCharacter.props.name + " for " + totalDamage + " points of damage!")
        };

        //Create a new slack alert object
        let channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);

        return '';
    }
}

/* Structure to add additional property validations
 QuickStrike.validations = [
 ...BaseAttack.validations,
 'playerCharacter',
 'targetCharacter',
 'requestZone',
 'currentMatch',
 'actionTaken'
 ];*/


module.exports = {
    QuickStrike
};