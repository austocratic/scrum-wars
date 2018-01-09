"use strict";

const _ = require('lodash');

const updateGameObjectsForReservedActionName = (gameObjects) => {
    console.log("gameObjects.userActionNameSelection: ", gameObjects.userActionNameSelection);

    if (gameObjects.userActionNameSelection === undefined) {
        throw "gameObjects.userActionNameSelection is undefined"
    }

    if (gameObjects.slackCallback === undefined) {
        return "gameObjects.slackCallback is undefined"
    }

    let slackCallbackElements = gameObjects.slackCallback.split("/");

    //Modify the "name" value depending on what reserved word was selected
    switch(gameObjects.userActionNameSelection) {
        case 'back':

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

            gameObjects.gameContext = lastKeyValue[0];
            gameObjects.userActionNameSelection = lastKeyValue[1];
            gameObjects.userActionValueSelection = lastKeyValue[2];

            //remove the last element from the array (the current context)
            slackCallbackElements
                .splice( slackCallbackElements.length - 3, slackCallbackElements.length);

            //If the callback had 3 game contexts, then there will be no slackCallbackElements to join, return the last 1st game context:
            if (slackCallbackElements.join("/").length === 0){
                console.log('DEBUG passed .length if statement');
                return gameObjects.gameContext;
            }

            gameObjects.slackCallback = slackCallbackElements.join("/") + "/" + gameObjects.gameContext;

            break;

        case 'more':

            let moreFinalKeyValue = slackCallbackElements[slackCallbackElements.length - 2]
                .split(":");

            if (moreFinalKeyValue[1] !== 'more'){
                return
            }

            //remove the last element from the array (the current context)
            slackCallbackElements
                .splice( slackCallbackElements.length - 2, slackCallbackElements.length);

            gameObjects.slackCallback = slackCallbackElements.join("/") + "/" + gameObjects.gameContext;

            break;
    }
};


module.exports = {
    updateGameObjectsForReservedActionName
};
