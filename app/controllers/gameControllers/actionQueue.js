"use strict";

const Character = require('../../../app/models/Character').Character;
const Action = require('../../../app/models/Action').Action;
const Zone = require('../../../app/models/Zone').Zone;

const validateGameObjects = require('../../helpers').validateGameObjects;
const actions = require('../actionControllers/actions/index');

const { DefensiveStance, BalancedStance, IntoShadow, Whirlwind, OffensiveStance,
    Firestorm, Cleave, ForkedLightning, ForkedLightning2 } = actions;

const actionControllers = {
    defensiveStance: DefensiveStance,
    offensiveStance: OffensiveStance,
    balancedStance: BalancedStance,
    intoShadow: IntoShadow,
    whirlwind: Whirlwind,
    '-Ky3C664qBFIYS4R4ItQ': Firestorm,
    '-Ky1zv4JXgbAKvxFFBmp': Cleave,
    '-KkdduB9XuB46EsxqwIX': ForkedLightning,
    '-KzFQs54K3qanmeGEEgF': ForkedLightning2
};

//Check that action queue for functions that should be initiated on the current turn
const actionQueue = (gameObjects) =>{
    console.log('Called actionQueue()');

    //If the current match has no action_queue property, then no actions are queued.  Function should exit
    if (!gameObjects.currentMatch.props.action_queue) {
        return;
    }

    console.log('actionQueue invoked number_turns: ', gameObjects.currentMatch.props.number_turns);

    //Iterate through effect queue
    gameObjects.currentMatch.props.action_queue
        //Process the effect
        .forEach( (eachActionToProcess, index) =>{

            //Create an action model
            gameObjects.actionTaken = new Action(gameObjects.game.state, eachActionToProcess.action_id);
            gameObjects.playerCharacter = new Character(gameObjects.game.state, eachActionToProcess.player_character_id);
            gameObjects.requestZone = new Zone(gameObjects.game.state, eachActionToProcess.channel_id);

            if (eachActionToProcess.target_character_id) {
                gameObjects.targetCharacter = new Character(gameObjects.game.state, eachActionToProcess.target_character_id);
            } else {
                gameObjects.targetCharacter = {};
            }

            //Declare the Class function without invoking
            const actionObjectToMake = actionControllers[gameObjects.actionTaken.id];

            validateGameObjects(gameObjects, actionObjectToMake.validations);

            let actionObject = new actionObjectToMake(gameObjects);

            //Process the action by passing in the relative turn
            actionObject.process(gameObjects.currentMatch.props.number_turns - eachActionToProcess.turn_initiated);

        });

    return true;
    //console.log('gameObjects after filter: ', gameObjects.currentMatch.props.action_queue);

};

module.exports = {
    actionQueue
};