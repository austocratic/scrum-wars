"use strict";

const Character = require('../../../app/models/Character').Character;
const Action = require('../../../app/models/Action').Action;
const Zone = require('../../../app/models/Zone').Zone;

const validateGameObjects = require('../../helpers').validateGameObjects;
const actions = require('../actionControllers/actions/index');

const { DefensiveStance, BalancedStance, IntoShadow, Whirlwind, OffensiveStance,
    Firestorm, Firestorm2, Cleave, ForkedLightning } = actions;

const actionControllers = {
    defensiveStance: DefensiveStance,
    offensiveStance: OffensiveStance,
    balancedStance: BalancedStance,
    intoShadow: IntoShadow,
    whirlwind: Whirlwind,
    '-KyZ-_1kQ7_4UrHLt1vR': Firestorm2,
    '-Ky3C664qBFIYS4R4ItQ': Firestorm,
    '-Ky1zv4JXgbAKvxFFBmp': Cleave,
    '-KkdduB9XuB46EsxqwIX': ForkedLightning
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
        //Process the effect
        .forEach( (eachEffectToProcess, index) =>{
            console.log('DEBUG eachEffectToProcess: ', eachEffectToProcess);

            console.log('processing index: ', index);

            //Create an action model
            gameObjects.actionTaken = new Action(gameObjects.game.state, eachEffectToProcess.action_id);
            gameObjects.playerCharacter = new Character(gameObjects.game.state, eachEffectToProcess.player_character_id);
            gameObjects.requestZone = new Zone(gameObjects.game.state, eachEffectToProcess.channel_id);

            if (eachEffectToProcess.target_character_id) {
                gameObjects.targetCharacter = new Character(gameObjects.game.state, eachEffectToProcess.target_character_id);
            } else {
                gameObjects.targetCharacter = {};
            }

            //Declare the Class function without invoking
            const actionObjectToMake = actionControllers[gameObjects.actionTaken.id];

            validateGameObjects(gameObjects, actionObjectToMake.validations);

            let actionObject = new actionObjectToMake(gameObjects);

            //Process the effect
            actionObject[eachEffectToProcess.effect_function]();

            //After effect has processed, remove it from effect queue
            gameObjects.currentMatch.props.effect_queue.splice(index, 1)

        });

    console.log('gameObjects after filter: ', gameObjects.currentMatch.props.effect_queue);

};




module.exports = {
    effectQueue
};