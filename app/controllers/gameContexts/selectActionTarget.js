"use strict";

const _ = require('lodash');
const updateCallback = require('../../helpers').updateCallback;

const validateGameObjects = require('../../helpers').validateGameObjects;

//let NPC = require('../../models/NPC').NPC;
let Character = require('../../models/Character').Character;
let Action = require('../../models/Action').Action;

const actionController = require('../actionController');
//TODO move slackRequest into this structure
const { QuickStrike, ArcaneBolt, LifeTap } = actionController;

const actionControllers = {

    //TODO for now I am only storing the game context & the action value selected (which is the action ID) in the callback string
    //Therefore I don't have access to the previous actionFunction selected.  I should restructure my callback strings to include all 3
    //values in the future.  Until then I will have to hard code the action ID's here

    '-Kjpe29q_fDkJG-73AQO': QuickStrike,
    '-KrJaBvyYDGrNVfcaAd0': ArcaneBolt,
    '-KkOq-y2_zgEgdhY-6_U': LifeTap,
};

const processActionOnTarget = gameObjects => {

    validateGameObjects(gameObjects, [
        'game',
        'userActionValueSelection',
        'slackCallback',
        'requestZone',
        'playerCharacter',
        'currentMatch'
    ]);

    //User selected a target character ID.  Create a character for that target
    gameObjects.targetCharacter = new Character(gameObjects.game.state, gameObjects.userActionValueSelection);
    
    let slackCallbackElements = gameObjects.slackCallback.split("/");
    let previousSelectionElements = slackCallbackElements[slackCallbackElements.length - 2];
    let previousValue = previousSelectionElements.split(":")[1];

    gameObjects.actionTaken = new Action(gameObjects.game.state, previousValue);

    validateGameObjects(gameObjects, [
        'targetCharacter',
        'actionTaken'
    ]);

    //Declare the Class function without invoking
    const actionObjectToMake = actionControllers[previousValue];

    //Invoke validation function using the classes's attached validation properties before instantiating the class
    validateGameObjects(gameObjects, actionObjectToMake.validations);
    
    let actionObject = new actionObjectToMake(gameObjects);

    actionObject.initiate();
};

module.exports = {
    processActionOnTarget
};
