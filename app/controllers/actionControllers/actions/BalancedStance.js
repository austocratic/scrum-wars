

const slack = require('../../../libraries/slack');
const BaseModify = require('./../baseActions/BaseModify').BaseModify;


//Balanced Stance is a stance that removes other stances (reverses the effects of stances)
//Static success chance
class BalancedStance extends BaseModify {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a balanced stance, but stumbles!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} enters a balanced combat stance!`;

        //Base Slack template
        this.slackPayload = {
            "username": this.actionCharacter.props.name,
            "icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
            "channel": this.slackChannel
        };
    }

    /*
    initiate(){
        //skill check
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            this.slackPayload.text = this.channelActionFailMessage;
            slack.sendMessage(this.slackPayload);
            return;
        }

        //Reverse any effects of this type
        this._reverseEffectsOfType(this.targetCharacter, this.actionTaken.props.type);

        this.slackPayload.text = this.channelActionSuccessMessage;
        slack.sendMessage(this.slackPayload);
    }*/
    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):
                if (this._avoidCheck(0, 0) === false) {
                    this.slackPayload.text = this.channelActionAvoidedMessage;
                    slack.sendMessage(this.slackPayload);
                    return;
                }

                //Reverse any effects of this type
                this._reverseEffectsOfType(this.targetCharacter, this.actionTaken.props.type);

                this.slackPayload.text = this.channelActionSuccessMessage;
                slack.sendMessage(this.slackPayload);
                break;
            case (turn >= 1):
                this._deleteActionInQueue();
                break;
        }
    }

}



module.exports = {
    BalancedStance
};