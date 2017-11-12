
const slack = require('../../../libraries/slack');
const BaseAttack = require('./../baseActions/BaseAttack').BaseAttack;


class Firestorm extends BaseAttack {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 1;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        //AOE Specific attributes
        this.maxTargetsAffected = 5;

        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

        //Alerts & Messages
        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts to conjure a *fiery storm*, but it fizzles away!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} unleashes a tempest of fire but ${this.targetCharacter.props.name} evades the the fiery downpour!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} unleashes a tempest of fire scorching ${this.targetCharacter.props.name} for ${this.calculatedDamage} points of damage!`;

        //Base Slack template
        this.slackPayload = {
            "username": this.actionCharacter.props.name,
            "icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
            "channel": this.slackChannel
        };

        this.effectQueue = [{
            "action_id": this.actionTaken.id,
            "activation_turn": (this.actionTaken.props.delay - 1) + this.currentMatch.props.number_turns,
            "channel_id": this.currentZone.props.channel_id,
            "effect_function": "continueCastingMessage",
            "player_character_id": this.actionCharacter.id
        },
        {
            "action_id": this.actionTaken.id,
            "activation_turn": this.actionTaken.props.delay + this.currentMatch.props.number_turns,
            "channel_id": this.currentZone.props.channel_id,
            "effect_function": "mainAction",
            "player_character_id": this.actionCharacter.id
        }]
    }

    initiate(){
        console.log('Called Firestorm.initiate()');

        this.slackPayload.text = `${this.actionCharacter.props.name} begins conjuring a *fiery spell*`;

        slack.sendMessage(this.slackPayload);

        //Push the effects into the effect queue
        this._insertEffectsInQueue()
    }

    continueCastingMessage(){
        this.slackPayload.text = `Heat ripples throughout the ${this.currentZone.props.name} as ${this.actionCharacter.props.name} continues conjuring a *fiery spell!*`;

        slack.sendMessage(this.slackPayload);
    }

    mainAction() {

        //Build a new message based on the randomTarget
        this.slackPayload.text = `${this.actionCharacter.props.name} unleashes a tempest of fire!`;
        slack.sendMessage(this.slackPayload);

        this.processOnSingleTarget = (singleTarget, avoidModifier) => {
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
            singleTarget.incrementProperty('health', -this.calculatedDamage);

            //Build a new message based on the randomTarget
            setTimeout( () => {
                this.slackPayload.text = `${this.actionCharacter.props.name}'s *fire storm* rains down, scorching ${singleTarget.props.name} for ${this.calculatedDamage} points of damage!`;
                slack.sendMessage(this.slackPayload);
            }, 500);

        };

        //Array to hold targets who have already been damaged.  Should not affect a character more than once
        let affectedCharacters = [];

        //Invoke process on target code each target
        for (let i = 0; i < this.maxTargetsAffected; i++){

            //Exclude any character already affected by passing in array
            let randomTarget = this._getRandomTarget(affectedCharacters);

            //As long as _getRandomTarget returns a character, continue
            if (randomTarget){

                this.processOnSingleTarget(randomTarget, 0);

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
    Firestorm
};