"use strict";

const _ = require('lodash');
const updateCallback = require('../../helpers').updateCallback;

let NPC = require('../../models/NPC').NPC;
let Character = require('../../models/Character').Character;

const actionController = require('../actionController');


const actionsAndThingsContext = {
    quickStrike: require('../actionController').QuickStrike
};

const processActionOnTarget = gameObjects => {

    let slackCallbackElements = gameObjects.slackCallback.split("/");

    let previousSelectionElements = slackCallbackElements[slackCallbackElements.length - 2];

    let previousSelection = previousSelectionElements.split(":");

    let previousValue = previousSelection[1];

    //User selected a target character ID.  Create a character for that target
    let targetCharacter = new Character(gameObjects.game.state, gameObjects.userActionValueSelection);

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
