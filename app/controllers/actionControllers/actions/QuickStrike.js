'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

class QuickStrike extends BaseAction {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

        //Alerts & Messages
        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a Quick Strike, but stumbles!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} lunges forward for a Quick Strike but ${this.targetCharacter.props.name} evades the attack!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} lunges forward with a powerful strike and lands a crushing blow on ${this.targetCharacter.props.name} for ${this.calculatedDamage} points of damage!`;
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
                this._processDamage(this.targetCharacter, this.calculatedDamage);

                console.log('DEBUG: processDamage is complete, about to return complete');

                return 'complete';

                break;
            /*
            case (turn >= 1):
                this._deleteActionInQueue();
                break;*/
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
    QuickStrike
};