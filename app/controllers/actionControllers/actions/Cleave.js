
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

        this.effectQueue = [{
            "action_id": this.actionTaken.id,
            "activation_turn": this.actionTaken.props.delay + this.currentMatch.props.number_turns,
            "channel_id": this.currentZone.props.channel_id,
            "effect_function": "mainAction",
            "player_character_id": this.actionCharacter.id,
            "target_character_id": this.targetCharacter.id,
        }]
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):
                this.slackPayload.attachments[0].text = `${this.actionCharacter.props.name} raises his sword to deliver a *cleaving blow!*`;
                slack.sendMessage(this.slackPayload);
                break;
            case (turn <= 1):
                //Evasion check
                //Arguments: accuracyModifier, avoidModifier
                if (this._avoidCheck(0, 0) === false) {
                    this.slackPayload.attachments[0].text = this.channelActionAvoidedMessage;
                    slack.sendMessage(this.slackPayload);
                    return;
                }

                this.slackPayload.attachments[0].text = this.channelActionSuccessMessage;
                slack.sendMessage(this.slackPayload);

                //Process damage & Interrupts
                this._processDamage();

                break;
            case (turn >= 2):
                this._deleteActionInQueue();
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
    Cleave
};