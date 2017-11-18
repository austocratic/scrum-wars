
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
        //this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} unleashes a tempest of fire but ${this.targetCharacter.props.name} evades the the fiery downpour!`;
        //this.channelActionSuccessMessage = `${this.actionCharacter.props.name} unleashes a tempest of fire scorching ${this.targetCharacter.props.name} for ${this.calculatedDamage} points of damage!`;

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

        //skill check
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            this.slackPayload.text = this.channelActionFailMessage;
            slack.sendMessage(this.slackPayload);
            return;
        }

        //If skill check does not fail, insert in queue
        this._insertEffectsInQueue();

        //Invoke process w/ turn 0
        this.process(0);
    }

    process(turn) {
        switch (true) {
            case (turn <= 0):

                //TODO I could have a helper that gets the turn message
                this.slackPayload.text = `${this.actionCharacter.props.name} begins conjuring a *fiery spell*`;
                slack.sendMessage(this.slackPayload);

                break;
            case (turn <= 1):

                this.slackPayload.text = `Heat ripples throughout the ${this.currentZone.props.name} as ${this.actionCharacter.props.name} continues conjuring a *fiery spell!*`;
                slack.sendMessage(this.slackPayload);

                break;
            case (turn <= 2):

                this.slackPayload.text = `${this.actionCharacter.props.name} unleashes a tempest of fire!`;
                slack.sendMessage(this.slackPayload);

                //Get targets, how can I standardize this?
                const targets = [];

                for (const target in this.maxTargetsAffected){

                    //Exclude any character already affected by passing in array
                    let randomTarget = this._getRandomTarget(targets);

                    //As long as _getRandomTarget returns a character, continue
                    if (randomTarget){

                        //Push character affected into array of characters affected (to be skipped by _getRandomTarget function)
                        targets.push(randomTarget)
                    }
                }

                //For each target
                targets.forEach( eachTarget =>{

                    //Evasion check
                    //Arguments: accuracyModifier, avoidModifier
                    //TODO possible standardize the evasion check across actions
                    if (this._avoidCheck(0, 0) === false) {
                        this.slackPayload.text = `${this.actionCharacter.props.name} unleashes a tempest of fire but ${eachTarget.props.name} evades the the fiery downpour!`;
                        slack.sendMessage(this.slackPayload);
                        return;
                    }

                    //Process all the other effects of the action
                    eachTarget.incrementProperty('health', -this.calculatedDamage);

                    //Build a new message based on the randomTarget
                    setTimeout( () => {
                        this.slackPayload.text = `${this.actionCharacter.props.name}'s *fire storm* rains down, scorching ${eachTarget.props.name} for ${this.calculatedDamage} points of damage!`;
                        slack.sendMessage(this.slackPayload);
                    }, 500);
                });

                break;
            case (turn <= 3):

                //Delete action from queue

                break;

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