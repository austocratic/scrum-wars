

const slack = require('../../../libraries/slack');
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

        this.calculatedPower = this._calculateStrength(this.basePower, this.actionCharacter.props.level, this.baseMin, this.baseMax);

        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a defensive stance, but stumbles!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} crouches and enters a defensive stance, increasing toughness by ${power} while lowering strength by ${power}!`;

        //Base Slack template
        this.slackPayload = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": this.slackChannel
        };
    }

    initiate(){
        
        //skill check
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            this.slackPayload.text = this.channelActionFailMessage;
            slack.sendMessage(this.slackPayload);
            return;
        }

        let statsToModify = {
            modified_toughness: this.calculatedPower,
            modified_strength: -this.calculatedPower
        };

        this._applyEffect(this.actionCharacter, statsToModify, this.actionTaken);
        
        this.slackPayload.text = this.channelActionSuccessMessage;
        slack.sendMessage(this.slackPayload);
    }
}

/*
DefensiveStance.validations = [
    ...BaseModify.validations
];*/

module.exports = {
    DefensiveStance
};