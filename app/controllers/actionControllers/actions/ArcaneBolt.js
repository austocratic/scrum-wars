
const Slack = require('../../../libraries/slack').Alert;
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

        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";

        //TODO I moved these out of the initiate function - need to make sure this works ok
        this.channelActionAvoidedMessage = (this.actionCharacter.props.name + " bolts of arcane energy streak from  " + this.actionCharacter.props.name + "'s fingers, but " + this.targetCharacter.props.name + " resists the bolt's harm");
        this.channelActionFailMessage = (this.actionCharacter.props.name + " attempts to conjure an Arcane Bolt, but the spell fizzles away!");

        //TODO I moved these out of the initiate function - need to make sure this works ok
        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);
    }

    initiate() {
        
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

        //Process all the other effects of the action
        //this._damageEffect(totalDamage);
        this._changeProperty(this.targetCharacter, {hit_points: -this.calculatedDamage});

        //Alert the channel of the action
        var alertDetails = {
            "username": this.actionCharacter.props.name,
            //"username": this.slackUserName,
            "icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
            //"icon_url": this.slackIcon,
            "channel": this.slackChannel,
            "text": (this.actionCharacter.props.name + " launches bolts of arcane energy which strike " + this.targetCharacter.props.name + " for " + this.calculatedDamage + " points of damage!")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);

        return '';
    }
}


module.exports = {
    ArcaneBolt
};