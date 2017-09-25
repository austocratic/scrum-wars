
const Slack = require('../../../libraries/slack').Alert;
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

        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";

    }

    initiate(){
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

        var power = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);

        var mitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);

        var totalDamage = this._calculateDamage(power, mitigation);

        console.log('actionCharacter.props: ', this.actionCharacter.props);

        this._changeProperty(this.targetCharacter, {hit_points: -totalDamage});

        console.log('actionCharacter.props: ', this.actionCharacter.props);

        var characterEffects = this.actionCharacter.props.effects;

        console.log('characterEffects: ', characterEffects);

        //Find all currently applied effects that change the targets is_hidden property
        if (this.actionCharacter.props.effects) {
            var hidingEffects = this.actionCharacter.props.effects.filter(eachEffect => {
                return eachEffect.modifiers.is_hidden === 1
            });

            console.log('effectsOfSameType: ', hidingEffects);

            //Reverse all effects that change is_hidden property
            hidingEffects.forEach(eachEffect => {
                this._reverseEffect(this.actionCharacter, eachEffect.action_id);
            });
        }

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": ("#" + this.currentZone.props.channel),
            "text": (this.actionCharacter.props.name + " emerges from the shadows and backstabs " + this.targetCharacter.props.name + " for " + totalDamage + " points of damage!")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);

        return '';
    }
}


module.exports = {
    Backstab
};