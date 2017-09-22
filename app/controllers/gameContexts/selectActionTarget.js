"use strict";

const _ = require('lodash');
const updateCallback = require('../../helpers').updateCallback;

let NPC = require('../../models/NPC').NPC;
let Character = require('../../models/Character').Character;

const actionController = require('../actionController');


const actionsAndThingsContext = {
    quickStrike: require('../actionController').QuickStrike
};

const processAction = (action, opts) => {
    console.log('slackRequest.processRequest()');

    console.log('DEBUG action: ', action);
    //console.log('DEBUG userSelection: ', userSelection);

    //let actualFn;

    //actualFn = actionsAndThingsContext[action];
    

    
    /*
    let actualFn;
    try {
        //For some game contexts, I don't have individual functions for each selection.  
        //In these cases, the same function will be invoked regardless of selection
        //Therefore, first set the function based on [action], then if there is a matching [userSelection], overwrite the function

        actualFn = actionsAndThingsContext[action];

        if (typeof actualFn === 'function') {
            return actualFn(opts);
        }

        actualFn = actionsAndThingsContext[action][userSelection];

    } catch(err) {
        // invalid action and user selection
        console.log('INVALID action & user selection: ', err)
    }
    if (typeof actualFn === 'function') {
        return actualFn(opts);
    }*/
};


const processActionOnTarget = gameObjects => {

    console.log('DEBUG ****^^#*$#*$&# userActionValueSelection: ', gameObjects.userActionValueSelection);

    console.log('gameObjects.slackCallback: ', gameObjects.slackCallback);

    let slackCallbackElements = gameObjects.slackCallback.split("/");

    let previousSelectionElements = slackCallbackElements[slackCallbackElements.length - 2];

    let previousSelection = previousSelectionElements.split(":");

    let previousValue = previousSelection[1];

    console.log('DEBUG* ***** * ** previousValue: ', previousValue);

    //User selected a target character ID.  Create a character for that target
    let targetCharacter = new Character(gameObjects.game.state, gameObjects.userActionValueSelection);

    //Need to determine the characters target

    //let actionObject = new actionsAndThingsContext.quickStrike;

    let actionObject = new actionsAndThingsContext[previousValue](
        gameObjects.playerCharacter,
        targetCharacter,
        gameObjects.requestZone,
        gameObjects.currentMatch,
        previousValue
    );

    actionObject.initiate();

    //return actionObject;
    /*
    let actionObject = new processAction('quickStrike', {

    });*/
};



module.exports = {
    processActionOnTarget
};
