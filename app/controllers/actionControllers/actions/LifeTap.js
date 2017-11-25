
const slack = require('../../../libraries/slack');
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

        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

        //Alerts & Messages
        this.playerActionFailedMessage = "Your target resists your spell!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts to cast Life Tap, but the spell fizzles away!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} conjures a life tapping effect but ${this.targetCharacter.props.name} resists the attack!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} conjures a life tapping effect and drains ${this.targetCharacter.props.name} for ${this.calculatedDamage} health!`;
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):
                if (this._avoidCheck(0, 0) === false) {
                    this.slackPayload.attachments[0].text = this.channelActionAvoidedMessage;
                    slack.sendMessage(this.slackPayload);
                    return;
                }

                this.slackPayload.attachments[0].text = this.channelActionSuccessMessage;
                slack.sendMessage(this.slackPayload);

                //Process damage & Interrupts
                this._processDamage();
                this.actionCharacter.incrementProperty('health', this.calculatedDamage);

                break;
            case (turn >= 1):
                this._deleteActionInQueue();
                break;
        }
    }
}

module.exports = {
    LifeTap
};