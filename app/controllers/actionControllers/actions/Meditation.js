'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

//Static success chance
class Meditation extends BaseAction {
    constructor(gameObjects, actionCharacter) {
        super(gameObjects, actionCharacter);

        this.baseSuccessChance = 1; //% chance of success
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;

        //TODO for testing, will be infinite duration in the future;
        //this.duration = 4;

        //this.playerActionFailedMessage = "Your attack fails!";
        //this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} fails to enter a *Meditative Trance*!`;

        //Modifiers to apply on action success
        this.statsToModify = {
            stamina_regeneration: 10
        };

        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} enters a deep *meditative Trance*, increasing stamina regeneration by ${this.statsToModify.stamina_regeneration}!`;
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
    Meditation
};