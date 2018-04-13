"use strict";


const _ = require('lodash');

//Models
const User = require('../models/User').User;
const Permission = require('../models/Permission').Permission;
const Zone = require('../models/Zone').Zone;
const Match = require('../models/Match').Match;
const Character = require('../models/Character').Character;
const Class = require('../models/Class').Class;

const declareGameObjects = (game, slackRequest) => {
    console.log('called Middleware: declareGameObjects() with slackRequest: ', JSON.stringify(slackRequest));

    let gameObjects = {
        currentMatch: new Match(game.state, game.getCurrentMatchID()),
        lastMatch: new Match(game.state, game.getLastMatchID()),
        //TODO I dont think that responseTemplate should be a standard game object....
        slackResponseTemplate: {}
    };

    //Process interactive_message specific properties
    if (slackRequest.type === 'interactive_message'){
        gameObjects.user = new User(game.state, slackRequest.user.id);
        gameObjects.requestZone = new Zone(game.state, slackRequest.channel.id);
        gameObjects.slackCallback = slackRequest.callback_id;

        let slackCallbackMajorElements = gameObjects.slackCallback.split("/");

        //let slackCallbackMinorElements = slackCallbackMajorElements[slackCallbackMajorElements.length - 1];
        gameObjects.gameContext = slackCallbackMajorElements[slackCallbackMajorElements.length - 1];

    } else {
        gameObjects.user = new User(game.state, slackRequest.user_id);
        gameObjects.requestZone = new Zone(game.state, slackRequest.channel_id)
    }

    console.log('****DEBUG declaring matchZone');
    console.log('****DEBUG gameObjects.currentMatch.props.zone_id: ', gameObjects.currentMatch.props.zone_id);

    gameObjects.matchZone = new Zone(game.state, game.state.zone[gameObjects.currentMatch.props.zone_id].channel_id);

    console.log('****DEBUG gameObjects.matchZone.props: ', gameObjects.matchZone.props);

    if (slackRequest.actions){
        if(slackRequest.actions[0].name) {
            gameObjects.userActionNameSelection = slackRequest.actions[0].name;
        }
        if(slackRequest.actions[0].value){
            gameObjects.userActionValueSelection = slackRequest.actions[0].value
        }
        if(slackRequest.actions[0].selected_options){
            gameObjects.userActionValueSelection = slackRequest.actions[0].selected_options[0].value
        }
    }

    gameObjects.permission = new Permission(game.state, gameObjects.user.props.permission_id);

    //If Slack user is not available in the DB, add them
    if (!_.find(game.state.user, {'slack_user_id': gameObjects.user.id})){
        console.log('Requesting user does not exist, adding');

        //console.log('DEBUG user: ', gameObjects.user);

        game.createUser(gameObjects.user.id);
    }

    //Slash commands have a command attribute
    if (slackRequest.command){
        gameObjects.command = slackRequest.command.slice(1, slackRequest.command.length);
    }

    if (slackRequest.text){
        gameObjects.slackText = slackRequest.text;
    }

    //Only instantiate playerCharacter if there is a character ID available to use
    if (gameObjects.user.props.character_id){
        gameObjects.playerCharacter = new Character(game.state, gameObjects.user.props.character_id);

        //In a few situations, the playerCharacter does not have a class_id yet (i.e: before the user has selected a class.  Default to undefined
        if (gameObjects.playerCharacter.props.class_id){
            gameObjects.characterClass = new Class(game.state, gameObjects.playerCharacter.props.class_id);
        }
    }

    return gameObjects;
};


module.exports = {
    declareGameObjects
};
