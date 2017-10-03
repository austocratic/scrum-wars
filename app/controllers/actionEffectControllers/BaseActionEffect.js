'use strict';

//const slack = require('../../../libraries/slack');
const _ = require('lodash');


class BaseActionEffect {
    constructor(gameObjects){

        this.game = gameObjects.game;
        //this.actionCharacter = gameObjects.playerCharacter;
        this.currentZone = gameObjects.requestZone;
        //this.currentMatch = gameObjects.currentMatch;
        //this.actionTaken = gameObjects.actionTaken;
        this.targetCharacter = gameObjects.targetCharacter;

        //this.slackIcon = gameObjects.game.baseURL + "assets/thumb/" + this.actionTaken.id + ".jpg";
        //this.slackIcon = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.actionTaken.id + ".jpg";
        this.slackUserName = "A mysterious voice";
        //this.slackChannel = ("#" + this.currentZone.props.channel);
    }

    //Object of stat/modifier key/value pairs
    _changeProperty(characterToModify, modifiers){

        let mergedProperty = _.merge(characterToModify.props, modifiers);

        characterToModify.props = mergedProperty;
    }

   
}

//Attach validations to the BaseAction
BaseActionEffect.validations = [
    'game',
    'currentMatch',
    'targetCharacter'
];

module.exports = {
    BaseActionEffect
};