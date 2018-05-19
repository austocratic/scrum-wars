"use strict";

const Character = require('../../../app/models/Character').Character;
const Action = require('../../../app/models/Action').Action;
const Zone = require('../../../app/models/Zone').Zone;

const validateGameObjects = require('../../helpers').validateGameObjects;
const actions = require('../actionControllers/actions/index');

const { BasicMelee, QuickStrike, ArcaneBolt, DefensiveStance, Backstab, LifeTap, PoisonedBlade, BalancedStance, IntoShadow, Whirlwind, OffensiveStance,
    Firestorm, Cleave, ForkedLightning } = actions;

const actionControllers = {
    '-LALEuXn3oNVmTXAAvIL': BasicMelee,
    '-Kjpe29q_fDkJG-73AQO': QuickStrike,
    '-KrJaBvyYDGrNVfcaAd0': ArcaneBolt,
    '-KjpeJT7Oct3ZCtLhENO': DefensiveStance,
    '-KkOq-y2_zgEgdhY-6_U': LifeTap,
    '-KvOpJ2FyGodmZCanea7': PoisonedBlade,
    '-Kxp5dhdmtUQ0aZ6YpiI': OffensiveStance,
    '-KqtOcn7MapqMfnGIZvo': BalancedStance,
    '-Kr3hnITyH9ZKx3VuZah': Backstab,
    '-Kkdk_CD5vx8vRGQD268': IntoShadow,
    '-KxkBOZgjEPwKmHOWueQ': Whirlwind,
    '-Ky3C664qBFIYS4R4ItQ': Firestorm,
    '-Ky1zv4JXgbAKvxFFBmp': Cleave,
    '-KkdduB9XuB46EsxqwIX': ForkedLightning
};

//Check that action queue for functions that should be initiated on the current turn
const actionQueue = (gameObjects) =>{
    console.log('Called actionQueue()');

    //If the current match has no action_queue property, then no actions are queued.  Function should exit
    if (!gameObjects.currentMatch.props.action_queue) {
        return;
    }

    //Iterate through effect queue
    gameObjects.currentMatch.props.action_queue
        //Determine if action has already been processed this turn
        .filter( eachActionInQueue =>{
            return eachActionInQueue.last_turn_processed !== gameObjects.currentMatch.props.number_turns
        })
        //Process the unprocessed actions
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
            //TODO need a way to handle if ID for actionControllers is undefined
            const actionObjectToMake = actionControllers[gameObjects.actionTaken.id];

            validateGameObjects(gameObjects, actionObjectToMake.validations);

            let actionObject = new actionObjectToMake(gameObjects);

            //Process the action by passing in the relative turn
            let actionResponse = actionObject.process(gameObjects.currentMatch.props.number_turns - eachActionToProcess.turn_initiated);

            //Check if action dealt damage for response action check.  If so, character struck can respond depending on action range
            if (actionResponse.damageDealt.length > 0){
                console.log('action dealt damage, processing response');
                actionResponse.damageDealt.forEach(eachActionResponse=>{
                    console.log('character id damaged and will now respond: ', eachActionResponse.targetID)

                    //Character struck now responds



                })
            }

            //Check if action is complete
            if (actionResponse.status === 'complete'){
                console.log('action is complete, remove from queue');
                actionObject._deleteActionInQueue();
            }

            //Always mark the action as processed this turn
            eachActionToProcess.last_turn_processed = gameObjects.currentMatch.props.number_turns;
        });

    return true;
    //console.log('gameObjects after filter: ', gameObjects.currentMatch.props.action_queue);

};

module.exports = {
    actionQueue
};