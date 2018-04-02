'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

//IntoShadow sets the character's is_visible property to zero.  This makes them unable to be targeted directly (can still be affected by area damage)
class IntoShadow extends BaseAction {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        this.playerActionFailedMessage = "You fail to enter the shadows!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts to fade into the shadows but is noticed, action failed!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} fades into the shadows!`;
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):

                let statsToModify = {
                    is_hidden: 1
                };

                //Mark the player's character as hidden
                this._applyEffect(this.actionCharacter, statsToModify);

                this.defaultActionPayload.attachments[0].text = this.channelActionSuccessMessage;
                slack.sendMessage(this.defaultActionPayload);

                return {
                    status: 'pending',
                    damageDealt: []
                };

                break;
            default:
                this._deleteActionInQueue();
                break;
        }
    }
}



module.exports = {
    IntoShadow
};