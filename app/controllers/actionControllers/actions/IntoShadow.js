

const Slack = require('../../../libraries/slack').Alert;
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
    }

    initiate(){
        this.channelActionFailMessage = (this.actionCharacter.props.name + " attempts to fade into the shadows but is noticed, action failed!")

        //Action success check
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            console.log('Skill FAILED!');
            return this.playerActionFailedMessage
        }

        //var totalPower = this._calculatePower(this.basePower, this.baseMin, this.baseMax, this.levelMultiplier);

        var statsToModify = {
            is_hidden: 1,
            actionsTest: {
                "-Kr3hnITyH9ZKx3VuZah": {
                    is_available: 1
                }
            }
        };

        this._applyEffect(this.targetCharacter, statsToModify, this.actionTaken);

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": ("#" + this.currentZone.props.channel),
            "text": (this.actionCharacter.props.name + " fades into the shadows!")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);

        return '';
    }
}



module.exports = {
    IntoShadow
};