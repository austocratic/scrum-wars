

const Slack = require('../../../libraries/slack').Alert;
const BaseModify = require('./../baseActions/BaseModify').BaseModify;



//Defensive Stance is a stance that increases AC & lowers attack
//Static success chance
class DefensiveStance extends BaseModify {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = 1; //% change of success
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 4;
        this.baseMitigation = 1;
        this.baseMin = 0;
        this.baseMax = 0;

        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
    }

    initiate(){
        this.channelActionFailMessage = (this.actionCharacter.props.name + " attempts a defensive stance, but stumbles!");

        //Action success check
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            console.log('Skill FAILED!');
            return this.playerActionFailedMessage
        }

        var power = this._calculateStrength(this.basePower, this.actionCharacter.props.level, this.baseMin, this.baseMax);

        var statsToModify = {
            modified_toughness: power,
            modified_strength: -power
        };

        this._applyEffect(this.targetCharacter, statsToModify, this.actionTaken);

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": ("#" + this.currentZone.props.channel),
            "text": (this.actionCharacter.props.name + " crouches and enters a defensive stance, increasing toughness by " + power + " while lowering strength by " + power + " !")
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);

        return '';
    }
}

/*
DefensiveStance.validations = [
    ...BaseModify.validations
];*/

module.exports = {
    DefensiveStance
};