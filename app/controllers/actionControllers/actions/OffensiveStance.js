'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

//Defensive Stance is a stance that increases AC & lowers attack
//Static success chance
class OffensiveStance extends BaseAction {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = 1; //% chance of success
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 4;
        this.baseMitigation = 1;
        this.baseMin = 0;
        this.baseMax = 0;

        this.calculatedPower = this._calculateStrength(this.basePower, this.actionCharacter.props.level, this.baseMin, this.baseMax);

        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts an offensive stance, but stumbles!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} enters a berserker's frenzy, increasing strength by ${this.calculatedPower} while lowering dexterity by ${this.calculatedPower}!`;

        //Modifiers to apply on action success
        this.statsToModify = {
            dexterity: -this.calculatedPower,
            strength: this.calculatedPower
        };
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):
                //Apply modifiers defined in constructor
                this._applyEffect(this.actionCharacter, this.statsToModify);

                this.slackPayload.attachments[0].text = this.channelActionSuccessMessage;
                slack.sendMessage(this.slackPayload);
                break;
            case (turn >= 1):
                this._deleteActionInQueue();
                break;
        }
    }
}

/*
DefensiveStance.validations = [
    ...BaseModify.validations
];*/

module.exports = {
    OffensiveStance
};