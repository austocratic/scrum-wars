'use strict';

//const slack = require('../../../libraries/slack');
const _ = require('lodash');


class BaseActionEffect {
    constructor(gameObjects){

        this.game = gameObjects.game;
        this.actionCharacter = gameObjects.playerCharacter;
        this.currentZone = gameObjects.requestZone;
        //this.currentMatch = gameObjects.currentMatch;
        //this.actionTaken = gameObjects.actionTaken;
        this.targetCharacter = gameObjects.targetCharacter;

        //this.slackIcon = gameObjects.game.baseURL + "assets/thumb/" + this.actionTaken.id + ".jpg";
        //this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        this.slackUserName = "A mysterious voice";
        //this.slackChannel = ("#" + this.currentZone.props.channel);
    }

    //If the character has the property, increment or decrement it by the value.
    //If the character does not have the value, return an error
    _changeProperty(characterToModify, modifiers){

        //Validate the the characterToModify had properties for each modifier key
        _.forEach(modifiers, (modifierValue, key) =>{
            if (!characterToModify.props[key]){
                throw new Error(`Called _changeProperty but attempted to modify a character that does not have one of the modifier's key's: ${key}`)
            }
            //Increment or decrement the property
            characterToModify.props[key] = characterToModify.props[key] + modifierValue;
        });
    }

   
}

//Attach validations to the BaseAction
BaseActionEffect.validations = [
    'game',
    'targetCharacter',
    'requestZone',
    'playerCharacter'
];

module.exports = {
    BaseActionEffect
};