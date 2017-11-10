"use strict";

const Character = require('../../../app/models/Character').Character;
const Action = require('../../../app/models/Action').Action;

const validateGameObjects = require('../../helpers').validateGameObjects;
const actions = require('../actionControllers/actions/index');

const { DefensiveStance, BalancedStance, IntoShadow, Whirlwind, OffensiveStance, Firestorm, Firestorm2 } = actions;

const actionControllers = {
    defensiveStance: DefensiveStance,
    offensiveStance: OffensiveStance,
    balancedStance: BalancedStance,
    intoShadow: IntoShadow,
    whirlwind: Whirlwind,
    firestorm: Firestorm,
    '-KyZ-_1kQ7_4UrHLt1vR': Firestorm2
};


//Check that action queue for functions that should be initiated on the current turn
const effectQueue = (gameObjects) =>{
    console.log('Called effectQueue()');

    //If the current match has no action_queue property, then no actions are queued.  Function should exit
    if (!gameObjects.currentMatch.props.effect_queue) {
        return;
    }

    //Iterate through effect queue
    gameObjects.currentMatch.props.effect_queue
        //Filter for effects to process on current turn
        .filter( eachEffectInQueue =>{
            return eachEffectInQueue.activation_turn === gameObjects.currentMatch.props.number_turns
        })
        .forEach( eachEffectToProcess =>{
            console.log('DEBUG eachEffectToProcess: ', eachEffectToProcess);

            //Create an action model
            gameObjects.actionTaken = new Action(gameObjects.game.state, eachEffectToProcess.action_id);
            gameObjects.playerCharacter = new Character(gameObjects.game.state, eachEffectToProcess.player_character_id);
            gameObjects.requestZone = new Zone(gameObjects.game.state, eachEffectToProcess.zone_id);
            gameObjects.targetCharacter = {};

            //Declare the Class function without invoking
            const actionObjectToMake = actionControllers[gameObjects.actionTaken.id];

            console.log('About to validate');

            validateGameObjects(gameObjects, actionObjectToMake.validations);

            console.log('Passed validate');

            let actionObject = new actionObjectToMake(gameObjects);

            actionObject[eachEffectToProcess.effect_function]();



        })
};




module.exports = {
    effectQueue
};