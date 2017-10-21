
const slack = require('../../../libraries/slack');
const BaseAttack = require('./../baseActions/BaseAttack').BaseAttack;


class Backstab extends BaseAttack {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .8;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 2;
        this.basePower = 10;
        this.baseMitigation = 1;
        this.baseMin = 3;
        this.baseMax = 8;

        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);
        
        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a Quick Strike, but stumbles!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} lunges forward for a Quick Strike but ${this.targetCharacter.props.name} evades the attack!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} emerges from the shadows and backstabs ${this.targetCharacter.props.name} for ${this.calculatedDamage} points of damage!`;

        //Base Slack template
        this.slackPayload = {
            "username": this.actionCharacter.props.name,
            "icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
            "channel": this.slackChannel
        };
    }

    initiate(){

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

        this.targetCharacter.incrementProperty('hit_points', -this.calculatedDamage);

        //Find all currently applied effects that change the targets is_hidden property
        if (this.actionCharacter.props.effects) {
            this.actionCharacter.props.effects
                .filter(eachEffect => {
                    return eachEffect.modifiers.modified_is_hidden === 1
                })
                .forEach(eachEffect => {
                    this._reverseEffect(this.actionCharacter, eachEffect.action_id);
            });
        }
        
        /*
        if (this.actionCharacter.props.is_hidden === 1){
            this._changeProperty(this.actionCharacter, {is_hidden: -1});
        }*/
        
        this.slackPayload.text = this.channelActionSuccessMessage;
        slack.sendMessage(this.slackPayload);
    }
}


module.exports = {
    Backstab
};