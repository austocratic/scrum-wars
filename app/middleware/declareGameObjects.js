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
    console.log('called Middleware: declareGameObjects() with slackRequest: ', JSON.stringify(slackRequest));

    let gameObjects = {
        currentMatch: new Match(game.state, game.getCurrentMatchID()),
        //TODO I dont think that responseTemplate should be a standard game object....
        slackResponseTemplate: {}
    };

    //Process interactive_message specific properties
    if (slackRequest.type === 'interactive_message'){
        gameObjects.user = new User(game.state, slackRequest.user.id);
        gameObjects.requestZone = new Zone(game.state, slackRequest.channel.id);
        gameObjects.slackCallback = slackRequest.callback_id;

        console.log('DEBUG gameObjects.slackCallback BEFORE update: ', gameObjects.slackCallback);

        let slackCallbackMajorElements = gameObjects.slackCallback.split("/");

        console.log('slackCallbackMajorElements: ', slackCallbackMajorElements);

        //let slackCallbackMinorElements = slackCallbackMajorElements[slackCallbackMajorElements.length - 1];
        gameObjects.gameContext = slackCallbackMajorElements[slackCallbackMajorElements.length - 1];

        //console.log('slackCallbackMinorElements: ', slackCallbackMinorElements);

        //The last element of the parsed callback string will be the context
        //gameObjects.gameContext = slackCallbackMinorElements[slackCallbackMinorElements.length - 3];

    } else {
        gameObjects.user = new User(game.state, slackRequest.user_id);
        gameObjects.requestZone = new Zone(game.state, slackRequest.channel_id)
    }

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

        //Format the callback string to include the name and value of user's selection
        gameObjects.slackCallback = `${gameObjects.slackCallback}:${gameObjects.userActionNameSelection}:${gameObjects.userActionValueSelection}/`;

        console.log('DEBUG modified callback: ', gameObjects.slackCallback)
    }

    gameObjects.permission = new Permission(game.state, gameObjects.user.props.permission_id);

    //See if slack user is available in DB
    //let slackRequestUserID = _.find(game.state.user, {'slack_user_id': gameObjects.user.id});

    //If Slack user is not available in the DB, add them
    if (!_.find(game.state.user, {'slack_user_id': gameObjects.user.id})){
        console.log('Requesting user does not exist, adding');
        game.createUser(gameObjects.user.id);
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

    return gameObjects;
};

const updateGameObjectsForReservedActionName = (gameObjects) => {
    console.log("gameObjects.userActionNameSelection: ", gameObjects.userActionNameSelection);

    if (gameObjects.userActionNameSelection === undefined) {
        throw "gameObjects.userActionNameSelection is undefined"
    }

    //Modify the "name" value depending on what reserved word was selected
    switch(gameObjects.userActionNameSelection) {
        case 'back':
            console.log('DEBUG: updateGameObjectsForReservedActionName contained name back');

            if (gameObjects.slackCallback === undefined) {
                return "gameObjects.slackCallback is undefined"
            }

            let slackCallbackElements = gameObjects.slackCallback.split("/");

            console.log('DEBUG slackCallbackElements: ', slackCallbackElements);

            //If the callback is less than 3 elements, we know that going "back" should invoke a /command function
            if (slackCallbackElements.length < 4) {
                console.log('DEBUG slackCallbackElements was less than 4, setting command property');
                gameObjects.command = slackCallbackElements[slackCallbackElements.length - 3].split(":")[1];
                gameObjects.gameContext = 'command';
                return
            }

            let lastKeyValue = slackCallbackElements[slackCallbackElements.length - 4]
                .split(":");

            console.log('DEBUG lastKeyValue: ', lastKeyValue);

            gameObjects.gameContext = lastKeyValue[0];
            gameObjects.userActionNameSelection = lastKeyValue[1];
            gameObjects.userActionValueSelection = lastKeyValue[2];

            //Remove the value from the key:value
            //lastKeyValue.pop();
            lastKeyValue
                .splice(lastKeyValue.length - 2, 2);

            //remove the last element from the array (the current context)
            slackCallbackElements
                .splice( slackCallbackElements.length - 4, slackCallbackElements.length);

            //If the callback had 3 game contexts, then there will be no slackCallbackElements to join, return the last 1st game context:
            if (slackCallbackElements.join("/").length === 0){
                //console.log('DEBUG passed .length if statement');
                return lastKeyValue[0];
            }

            gameObjects.slackCallback = slackCallbackElements.join("/") + "/" + lastKeyValue[0];

            break;
    }

};

const modifyCallbackForBack = slackCallback => {
    console.log('called function modifyCallbackForBack');

    //Split up the callback string
    let slackCallbackElements = slackCallback.split("/");

    //console.log('DEBUG modifyCallbackForBack, slackCallbackElements: ', slackCallbackElements);

    //If the callback string is less than 4 elements then it has at most 3 game contexts.
    //In order to go "back" we need to get the context that is 2 elements down.

    if (slackCallbackElements.length < 4) {
        console.log('DEBUG slackCallbackElements was less than 3');
        return slackCallbackElements[slackCallbackElements.length - 3]
            .split(":")[0];
    }

    //take the last element & split it into context:name:value
    let lastKeyValue = slackCallbackElements[slackCallbackElements.length - 3]
        .split(":");

    //Remove the value from the key:value
    //lastKeyValue.pop();
    lastKeyValue
        .splice(lastKeyValue.length - 2, 2);

    //remove the last element from the array (the current context)
    slackCallbackElements
        .splice( slackCallbackElements.length - 3, slackCallbackElements.length);

    //console.log('DEBUG slackCallbackElements after splice: ', slackCallbackElements);

    //console.log('DEBUG lastKeyValue after splice: ', lastKeyValue);

    //If the callback had 3 game contexts, then there will be no slackCallbackElements to join, return the last 1st game context:
    if (slackCallbackElements.join("/").length === 0){
        //console.log('DEBUG passed .length if statement');
        return lastKeyValue[0];
    }

    let modifiedCallback = slackCallbackElements.join("/") + "/" + lastKeyValue[0];

    //console.log('DEBUG modifyCallbackForBack modifiedCallback: ', modifiedCallback);

    //If there are more elements to join (does not hit if above), concatenate
    return modifiedCallback
};



module.exports = {
    declareGameObjects,
    updateGameObjectsForReservedActionName
};
