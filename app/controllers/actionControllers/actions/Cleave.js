
const slack = require('../../../libraries/slack');
const BaseAttack = require('./../baseActions/BaseAttack').BaseAttack;


class Cleave extends BaseAttack {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 5;
        this.baseAvoidScore = 5;
        this.basePower = 12;
        this.baseMitigation = 1;
        this.baseMin = 7;
        this.baseMax = 8;

        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

        //Alerts & Messages
        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a massive cleaving attack, but stumbles!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} attempts a massive cleaving attack but ${this.targetCharacter.props.name} evades the attack!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name}'s blade comes *cleaving* down delivering a massive blow to ${this.targetCharacter.props.name} for ${this.calculatedDamage} points of damage!`;

        //Base Slack template
        this.slackPayload = {
            "username": this.actionCharacter.props.name,
            "icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
            "channel": this.slackChannel
        };

        this.effectQueue = [{
            "action_id": this.actionTaken.id,
            "activation_turn": 1 + this.currentMatch.props.number_turns,
            "channel_id": this.currentZone.props.channel_id,
            "effect_function": "mainAction",
            "player_character_id": this.actionCharacter.id,
            "target_character_id": this.targetCharacter.id,
        }]
    }

    initiate(){
        console.log('Called Cleave.initiate()');

        this.slackPayload.text = `${this.actionCharacter.props.name} raises his sword to deliver a *cleaving blow!*`;

        slack.sendMessage(this.slackPayload);

        //Push the effects into the effect queue
        this._insertEffectsInQueue()
    }

    mainAction() {

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

        this.slackPayload.text = this.channelActionSuccessMessage;
        slack.sendMessage(this.slackPayload);
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
    Cleave
};