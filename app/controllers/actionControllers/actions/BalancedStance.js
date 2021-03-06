'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

//Balanced Stance is a stance that removes other stances (reverses the effects of stances)
//Static success chance
class BalancedStance extends BaseAction {
    constructor(gameObjects, actionCharacter) {
        super(gameObjects, actionCharacter);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        //this.playerActionFailedMessage = "Your attack fails!";
        //this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a balanced stance, but stumbles!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} enters a balanced combat stance!`;
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):

                //Reverse any effects of this type
                this._reverseEffectsOfType(this.targetCharacter, this.actionTaken.props.type);

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
    BalancedStance
};