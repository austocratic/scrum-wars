'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

//Defensive Stance is a stance that increases AC & lowers attack
//Static success chance
class AxeorsShielding extends BaseAction {
    constructor(gameObjects, actionCharacter) {
        super(gameObjects, actionCharacter);

        this.baseSuccessChance = 1; //% chance of success
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;

        //TODO for testing, will be infinite duration in the future;
        //this.duration = 4;

        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a shielding barrier, but their spell fizzles!`;

        //Modifiers to apply on action success
        this.statsToModify = {
            armor: 5,
            health: 5
        };

        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} shields their skin with a shimmering barrier, increasing armor by ${this.statsToModify.armor}, attack mitigation ${this.statsToModify.health}!`;
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
                    status: 'complete',
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
    AxeorsShielding
};