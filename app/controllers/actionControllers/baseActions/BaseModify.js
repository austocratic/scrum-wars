
var _ = require('lodash');
const BaseAction = require('./BaseAction').BaseAction;

class BaseModify extends BaseAction{
    //constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken) {
    constructor(gameObjects) {

        //Validate the constructor inputs.  All should be objects
        /*
         console.log('DEBUG, typeof actionCharacter = ', typeof actionCharacter);
         console.log('DEBUG, typeof targetCharacter = ', typeof targetCharacter);
         console.log('DEBUG, typeof currentZone = ', typeof currentZone);
         console.log('DEBUG, typeof currentMatch = ', typeof currentMatch);
         console.log('DEBUG, typeof actionTaken = ', typeof actionTaken);*/

        //super(actionCharacter, currentZone, currentMatch, actionTaken);
        super(gameObjects);

        this.targetCharacter = gameObjects.targetCharacter;
    }

    _reverseEffectsOfType(character, effectType){

        var characterEffects = character.props.effects;

        //Lookup all actionControllers that have the same type as the actionTaken
        var effectsOfSameType = _.filter(characterEffects, {type: effectType});

        console.log('effectsOfSameType: ', effectsOfSameType);

        effectsOfSameType.forEach( eachEffect =>{
            this._reverseEffect(this.targetCharacter, eachEffect.action_id);
        });
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
}

BaseModify.validations = [
    ...BaseAction.validations
];


module.exports = {
    BaseModify
};