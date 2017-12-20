"use strict";


const _ = require('lodash');

//Models
const User = require('../models/User').User;
const Permission = require('../models/Permission').Permission;
const Zone = require('../models/Zone').Zone;
const Match = require('../models/Match').Match;
const Character = require('../models/Character').Character;
const Class = require('../models/Class').Class;

/*
const declareGameObjects = (req) => {
    console.log('called Middleware: declareGameObjects()');

    //Declare standard objects (from getSlashCommandResponse)
    
    console.log('DEBUG: req.body: ', req.body.payload.user_id);

    //See if slack user is available in DB
    let slackRequestUserID = _.find(req.gameObjects.game.state.user, {'slack_user_id': req.body.payload.user_id});

    //If Slack user is not available in the DB, add them
    if (!slackRequestUserID){
        console.log('Requesting user does not exist, adding');
        game.createUser(req.body.payload.user_id);
    }

    //Slash commands have a command attribute
    if (req.body.payload.command){
        req.gameObjects.command = req.body.payload.command.slice(1, req.body.payload.command.length);
    }

    //Declare a user based on the slack ID making the request
    req.gameObjects.user = new User(req.gameObjects.game.state, req.body.payload.user_id);

    //Declare a permission based on user's permission
    req.gameObjects.permission = new Permission(req.gameObjects.game.state, req.gameObjects.user.props.permission_id);

    req.gameObjects.requestZone = new Zone(req.gameObjects.game.state, req.body.payload.channel_id);
    req.gameObjects.currentMatch = new Match(req.gameObjects.game.state, req.gameObjects.game.getCurrentMatchID());
    
    //Only instantiate playerCharacter if there is a character ID available to use
    if (req.gameObjects.user.props.character_id){
        req.gameObjects.playerCharacter = new Character(req.gameObjects.game.state, req.gameObjects.user.props.character_id);

        //In a few situations, the playerCharacter does not have a class_id yet (i.e: before the user has selected a class.  Default to undefined
        if (req.gameObjects.playerCharacter.props.class_id){
            req.gameObjects.characterClass = new Class(req.gameObjects.game.state, req.gameObjects.playerCharacter.props.class_id);
        }
    }


    //Declare standard objects (from getInteractiveMessageResponse)

};*/

const declareGameObjects = (game, slackRequest) => {
    console.log('called Middleware: declareGameObjects()');

    let gameObjects = {
        user: new User(game.state, slackRequest.user_id),
        requestZone: new Zone(game.state, slackRequest.channel_id),
        currentMatch: new Match(game.state, game.getCurrentMatchID()),
        //TODO I dont think that responseTemplate should be a standard game object....
        slackResponseTemplate: {}
    };

    gameObjects.permission = new Permission(game.state, gameObjects.user.props.permission_id);

    //See if slack user is available in DB
    let slackRequestUserID = _.find(game.state.user, {'slack_user_id': slackRequest.user_id});

    //If Slack user is not available in the DB, add them
    if (!slackRequestUserID){
        console.log('Requesting user does not exist, adding');
        game.createUser(slackRequest.user_id);
    }

    //Slash commands have a command attribute
    if (slackRequest.command){
        gameObjects.command = slackRequest.command.slice(1, slackRequest.command.length);
    }

    //Only instantiate playerCharacter if there is a character ID available to use
    if (gameObjects.user.props.character_id){
        gameObjects.playerCharacter = new Character(game.state, gameObjects.user.props.character_id);

        //In a few situations, the playerCharacter does not have a class_id yet (i.e: before the user has selected a class.  Default to undefined
        if (gameObjects.playerCharacter.props.class_id){
            gameObjects.characterClass = new Class(game.state, gameObjects.playerCharacter.props.class_id);
        }
    }

    console.log('DEBUG gameObjects.user.props: ', gameObjects.user.props);
    console.log('DEBUG gameObjects.requestZone.props: ', gameObjects.requestZone.props);
    console.log('DEBUG gameObjects.match.props: ', gameObjects.currentMatch.props);
    console.log('DEBUG gameObjects.permission.props: ', gameObjects.permission.props);

    return gameObjects;

    //Declare standard objects (from getInteractiveMessageResponse)

};


module.exports = {
    declareGameObjects
};
