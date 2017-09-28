

const Slack = require('../../../libraries/slack').Alert;
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
    }

    initiate(){
        this.channelActionFailMessage = (this.actionCharacter.props.name + " attempts a balanced stance, but stumbles!");

        //Action success check
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            console.log('Skill FAILED!');
            return this.playerActionFailedMessage
        }

        //Reverse any effects of this type
        this._reverseEffectsOfType(this.targetCharacter, this.actionTaken.props.type);

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": ("#" + this.currentZone.props.channel),
            "text": (this.actionCharacter.props.name + " enters a balanced combat stance!")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);

        return '';
    }
}



module.exports = {
    BalancedStance
};