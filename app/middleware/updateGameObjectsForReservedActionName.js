"use strict";

const _ = require('lodash');

//Models
const User = require('../models/User').User;
const Permission = require('../models/Permission').Permission;
const Zone = require('../models/Zone').Zone;
const Match = require('../models/Match').Match;
const Character = require('../models/Character').Character;
const Class = require('../models/Class').Class;

const updateGameObjectsForReservedActionName = (gameObjects) => {
    console.log("gameObjects.userActionNameSelection: ", gameObjects.userActionNameSelection);

    if (gameObjects.userActionNameSelection === undefined) {
        throw "gameObjects.userActionNameSelection is undefined"
    }

    //Modify the "name" value depending on what reserved word was selected
    switch(gameObjects.userActionNameSelection) {
        case 'back':

            if (gameObjects.slackCallback === undefined) {
                return "gameObjects.slackCallback is undefined"
            }

            let slackCallbackElements = gameObjects.slackCallback.split("/");

            //If the callback is less than 3 elements, we know that going "back" should invoke a /command function
            if (slackCallbackElements.length < 3) {
                console.log('DEBUG slackCallbackElements was less than 4, setting command property');
                let firstKeyValue = slackCallbackElements[0]
                    .split(":");
                gameObjects.gameContext = firstKeyValue[0];
                gameObjects.command = firstKeyValue[1];
                gameObjects.userActionNameSelection = firstKeyValue[1];
                return
            }

            let lastKeyValue = slackCallbackElements[slackCallbackElements.length - 3]
                .split(":");

            console.log('lastKeyValue before splice: ', lastKeyValue);

            gameObjects.gameContext = lastKeyValue[0];
            gameObjects.userActionNameSelection = lastKeyValue[1];
            gameObjects.userActionValueSelection = lastKeyValue[2];

            //remove the last element from the array (the current context)
            slackCallbackElements
                .splice( slackCallbackElements.length - 3, slackCallbackElements.length);

            console.log('slackCallbackElements: ', slackCallbackElements);

            //If the callback had 3 game contexts, then there will be no slackCallbackElements to join, return the last 1st game context:
            if (slackCallbackElements.join("/").length === 0){
                console.log('DEBUG passed .length if statement');
                return gameObjects.gameContext;
            }

            console.log('Updated slackCallback before BACK update: ', gameObjects.slackCallback);
            gameObjects.slackCallback = slackCallbackElements.join("/") + "/" + gameObjects.gameContext;
            //gameObjects.slackCallback = slackCallbackElements.join("/") + `:${gameObjects.userActionNameSelection}:${gameObjects.userActionValueSelection}:` + "/" + gameObjects.gameContext;
            console.log('Updated slackCallback after BACK update: ', gameObjects.slackCallback);

            break;
    }
};


module.exports = {
    updateGameObjectsForReservedActionName
};
