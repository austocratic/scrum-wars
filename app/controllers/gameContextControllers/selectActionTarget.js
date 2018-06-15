"use strict";

const _ = require('lodash');
const updateCallback = require('../../helpers').updateCallback;

const validateGameObjects = require('../../helpers').validateGameObjects;

//let NPC = require('../../models/NPC').NPC;
let Character = require('../../models/Character').Character;
let Action = require('../../models/Action').Action;

const actions = require('../actionControllers/actions/index');

const { BasicMelee, QuickStrike, ArcaneBolt, FlameBurst, RisingPunch, FistOfThunder, LifeTap, Backstab, PoisonedBlade, StingingBees,
    ForkedLightning, Cleave, MinorHealing, CoatOfBark } = actions;

//TODO I may want to make this a stand alone file/function "getActionController" so that it can be re used in Game to process effects
const actionControllers = {

    //TODO for now I am only storing the game context & the action value selected (which is the action ID) in the callback string
    //Therefore I don't have access to the previous actionFunction selected.  I should restructure my callback strings to include all 3
    //values in the future.  Until then I will have to hard code the action ID's here

    '-LALEuXn3oNVmTXAAvIL': BasicMelee,
    '-Kjpe29q_fDkJG-73AQO': QuickStrike,
    '-KrJaBvyYDGrNVfcaAd0': ArcaneBolt,
    '-LE6OGOxY_a8_vELbQ0O': FlameBurst,
    '-LEq2YugJUJ7r1Eae7--': RisingPunch,
    '-LF41ilkoZfJTgtk2JYk': FistOfThunder,
    '-KkOq-y2_zgEgdhY-6_U': LifeTap,
    '-Kr3hnITyH9ZKx3VuZah': Backstab,
    '-KvOpJ2FyGodmZCanea7': PoisonedBlade,
    '-LEegu3kNYmpDpQIPaSV': StingingBees,
    '-KkdduB9XuB46EsxqwIX': ForkedLightning,
    '-Ky1zv4JXgbAKvxFFBmp': Cleave,
    '-LE68rplHU9ntql53T4q': MinorHealing,
    '-LE6ST406BzgFqGn2dDK': CoatOfBark
};

const processActionOnTarget = gameObjects => {
    console.log('called processActionOnTarget');

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

    let previousSelectionElements = slackCallbackElements[slackCallbackElements.length - 3];
    let previousValue = previousSelectionElements.split(":")[2];

    gameObjects.actionTaken = new Action(gameObjects.game.state, previousValue);

    validateGameObjects(gameObjects, [
        'targetCharacter',
        'actionTaken',
        'playerCharacter'
    ]);

    //Validate that the action is in the actionControllers mapping above
    //If not return an error to Slack
    if (!actionControllers[previousValue]){
        return {
            "text": `Error: selected action value ${previousValue} but that is missing from selectActionTarget action mapping!`
        }
    }

    //Declare the Class function without invoking
    const actionObjectToMake = actionControllers[previousValue];

    //Invoke validation function using the classes's attached validation properties before instantiating the class
    validateGameObjects(gameObjects, actionObjectToMake.validations);
    
    let actionData = new actionObjectToMake(gameObjects, gameObjects.playerCharacter);

    //Perform the action
    actionData.initiate();

    //Mark the action as used, pass in action id & turn number
    gameObjects.playerCharacter.updateActionUsed(actionData.actionTaken.id, gameObjects.currentMatch.props.number_turns);

    return {
        "text": `_You perform ${actionData.actionTaken.props.name}_`
    }
};

module.exports = {
    processActionOnTarget
};
