"use strict";

const _ = require('lodash');
const updateCallback = require('../../helpers').updateCallback;

const validateGameObjects = require('../../helpers').validateGameObjects;

//let NPC = require('../../models/NPC').NPC;
let Character = require('../../models/Character').Character;
let Action = require('../../models/Action').Action;

const actions = require('../actionControllers/actions/index');

const { QuickStrike, ArcaneBolt, LifeTap, Backstab, PoisonedBlade, ForkedLightning, Cleave } = actions;

//TODO I may want to make this a stand alone file/function "getActionController" so that it can be re used in Game to process effects
const actionControllers = {

    //TODO for now I am only storing the game context & the action value selected (which is the action ID) in the callback string
    //Therefore I don't have access to the previous actionFunction selected.  I should restructure my callback strings to include all 3
    //values in the future.  Until then I will have to hard code the action ID's here

    '-Kjpe29q_fDkJG-73AQO': QuickStrike,
    '-KrJaBvyYDGrNVfcaAd0': ArcaneBolt,
    '-KkOq-y2_zgEgdhY-6_U': LifeTap,
    '-Kr3hnITyH9ZKx3VuZah': Backstab,
    '-KvOpJ2FyGodmZCanea7': PoisonedBlade,
    '-KkdduB9XuB46EsxqwIX': ForkedLightning,
    '-Ky1zv4JXgbAKvxFFBmp': Cleave
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

    //Validate that the action is in the actionControllers mapping above
    //If not return an error to Slack
    if (!actionControllers[previousValue]){
        return {
            "text": "Error: that action is missing from selectActionTarget action mapping!"
        }
    }

    //Declare the Class function without invoking
    const actionObjectToMake = actionControllers[previousValue];

    //Invoke validation function using the classes's attached validation properties before instantiating the class
    validateGameObjects(gameObjects, actionObjectToMake.validations);
    
    gameObjects.actionTaken = new actionObjectToMake(gameObjects);

    //Perform the action
    gameObjects.actionTaken.initiate();

    //Mark the action as used, pass in action id & turn number
    gameObjects.playerCharacter.updateActionUsed(gameObjects.actionTaken.id, gameObjects.currentMatch.props.number_turns);

    console.log('!!!DEBUG gameObjects.actionTaken: ', gameObjects.actionTaken);

    return {
        "text": `_You perform ${gameObjects.actionTaken.props.name}_`
    }
};

module.exports = {
    processActionOnTarget
};
