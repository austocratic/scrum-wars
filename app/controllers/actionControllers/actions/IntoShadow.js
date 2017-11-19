
const slack = require('../../../libraries/slack');
const BaseModify = require('./../baseActions/BaseModify').BaseModify;


//IntoShadow sets the character's is_visible property to zero.  This makes them unable to be targeted directly (can still be affected by area damage)
class IntoShadow extends BaseModify {
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

        //Base Slack template
        this.slackPayload = {
            "username": this.actionCharacter.props.name,
            "icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
            "channel": this.slackChannel
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
                //TODO need to validate that the player is not already hidden and prevent hiding if already hidden
                let statsToModify = {
                    is_hidden: 1
                };

                //Mark the player's character as hidden
                this._applyEffect(this.actionCharacter, statsToModify);

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
    IntoShadow
};