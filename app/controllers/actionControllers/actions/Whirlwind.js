
const slack = require('../../../libraries/slack');
const BaseAttack = require('./../baseActions/BaseAttack').BaseAttack;


class Whirlwind extends BaseAttack {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        //AOE Specific attributes
        this.maxTargetsAffected = 3;

        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

        //Alerts & Messages
        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a Quick Strike, but stumbles!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} lunges forward for a Quick Strike but ${this.targetCharacter.props.name} evades the attack!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} lunges forward with a powerful strike and lands a crushing blow on ${this.targetCharacter.props.name} for ${this.calculatedDamage} points of damage!`;

        //Base Slack template
        this.slackPayload = {
            "username": this.actionCharacter.props.name,
            "icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
            "channel": this.slackChannel
        };
    }

    initiate() {

        //Build a new message based on the randomTarget
        this.slackPayload.text = `${this.actionCharacter.props.name} becomes a whirlwind of blades, striking our wildly!`;
        slack.sendMessage(this.slackPayload);

        const processOnSingleTarget = (singleTarget, avoidModifier) => {
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
            singleTarget.incrementProperty('hit_points', -this.calculatedDamage);

            //Build a new message based on the randomTarget
            setTimeout( () => {
                this.slackPayload.text = `${this.actionCharacter.props.name}'s whirling blades strike ${singleTarget.props.name} for ${this.calculatedDamage} points of damage!`;
                slack.sendMessage(this.slackPayload);
            }, 500);

        };

        //Array to hold targets who have already been damaged.  ForkedLightning should not affect a character more than once
        let affectedCharacters = [];

        //Invoke process on target code each target
        for (let i = 0; i < this.maxTargetsAffected; i++){
            console.log('DEBUG invoking processOnSingleTarget in loop');

            //Exclude any character already affected by passing in array
            let randomTarget = this._getRandomTarget(affectedCharacters);

            //As long as _getRandomTarget returns a character, continue
            if (randomTarget){
                console.log('DEBUG Whirlwind, processing on randomTarget.id: ', randomTarget.id);

                processOnSingleTarget(randomTarget, 0);

                //Push character affected into array of characters affected (to be skipped by _getRandomTarget function)
                affectedCharacters.push(randomTarget)
            }
        }
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
    Whirlwind
};