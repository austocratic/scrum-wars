'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

//Defensive Stance is a stance that increases AC & lowers attack
//Static success chance
class OffensiveStance extends BaseAction {
    constructor(gameObjects, actionCharacter) {
        super(gameObjects, actionCharacter);

        this.baseSuccessChance = 1; //% chance of success
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;

        this.calculatedPower = this._calculateStrength(this.basePower, this.actionCharacter.props.level, this.baseMin, this.baseMax);

        //this.playerActionFailedMessage = "Your attack fails!";
        //this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts an offensive stance, but stumbles!`;

        //Modifiers to apply on action success
        this.statsToModify = {
            attack_mitigation: -5,
            attack_power: 10
        };

        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} crouches and enters an *offensive stance*, increasing attack power by ${this.statsToModify.attack_power} while lowering attack mitigation by ${this.statsToModify.attack_mitigation}!`;
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

                this.defaultActionPayload.attachments[0].text = this.channelActionSuccessMessage;
                slack.sendMessage(this.defaultActionPayload);

                return {
                    status: 'pending',
                    damageDealt: []
                };

                break;
            default:
                return this._getDefaultProcessResponse();
                break;
        }
    }
}


module.exports = {
    OffensiveStance
};