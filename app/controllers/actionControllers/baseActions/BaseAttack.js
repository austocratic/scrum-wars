
const BaseAction = require('./BaseAction').BaseAction;


class BaseAttack extends BaseAction{
    //constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
    //super(actionCharacter, currentZone, currentMatch, actionTaken);

    constructor(gameObjects) {
        super(gameObjects);
    }

    _avoidCheck(accuracyModifier, avoidModifier){

        var accuracyScore = this.baseAccuracyScore + accuracyModifier + this._getRandomIntInclusive(1, 10);
        var avoidScore = this.baseAvoidScore + avoidModifier + this._getRandomIntInclusive(1, 10);
        console.log('_isAvoided check, accuracyScore = ' + accuracyScore + ' avoidScore = ' + avoidScore);

        if(accuracyScore >= avoidScore){
            return true
        }

        //Alert the channel of the action
        var alertDetails = {
            "username": this.slackUserName,
            "icon_url": this.slackIcon,
            "channel": this.slackChannel,
            "text": this.channelActionAvoidedMessage
        };

        //Create a new slack alert object
        var channelAlert = new Slack(alertDetails);

        //Send alert to slack
        channelAlert.sendToSlack(this.params);

        return false
    }

    /*
     _setValues(){

     this.chanceToAvoid = this.baseChanceToAvoid + (this.targetCharacter.props.dexterity / 100);
     this.damageMitigation = (this.targetCharacter.props.toughness + this.targetCharacter.props.armor) / 10;

     super._setValues();
     }*/

    _calculateDamage(damage, mitigation){

        var totalDamage = damage - mitigation;

        if (totalDamage < 0) {
            return 0;
        }

        return totalDamage;
    }
}

BaseAttack.validations = [
    ...BaseAction.validations
];



module.exports = {
    BaseAttack
};