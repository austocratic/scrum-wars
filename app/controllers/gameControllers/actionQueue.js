"use strict";

const Character = require('../../../app/models/Character').Character;
const Action = require('../../../app/models/Action').Action;
const Zone = require('../../../app/models/Zone').Zone;

const validateGameObjects = require('../../helpers').validateGameObjects;
const actions = require('../actionControllers/actions/index');

const { BasicMelee, QuickStrike, ArcaneBolt, DefensiveStance, AxeorsShielding, InspiringShout, SmokeBomb, Backstab, LifeTap, PoisonedBlade, BalancedStance, IntoShadow, Whirlwind, OffensiveStance,
    Firestorm, Cleave, ForkedLightning, MinorHealing } = actions;

const actionControllers = {
    '-LALEuXn3oNVmTXAAvIL': BasicMelee,
    '-Kjpe29q_fDkJG-73AQO': QuickStrike,
    '-KrJaBvyYDGrNVfcaAd0': ArcaneBolt,
    '-KjpeJT7Oct3ZCtLhENO': DefensiveStance,
    '-LDZ4GJde7BFOcsHj-A8': AxeorsShielding,
    '-LDZCkTLVTCbCHfs1naD': InspiringShout,
    '-LDdI2BE1SumjBkWkcfZ': SmokeBomb,
    '-KkOq-y2_zgEgdhY-6_U': LifeTap,
    '-KvOpJ2FyGodmZCanea7': PoisonedBlade,
    '-Kxp5dhdmtUQ0aZ6YpiI': OffensiveStance,
    '-KqtOcn7MapqMfnGIZvo': BalancedStance,
    '-Kr3hnITyH9ZKx3VuZah': Backstab,
    '-Kkdk_CD5vx8vRGQD268': IntoShadow,
    '-KxkBOZgjEPwKmHOWueQ': Whirlwind,
    '-Ky3C664qBFIYS4R4ItQ': Firestorm,
    '-Ky1zv4JXgbAKvxFFBmp': Cleave,
    '-KkdduB9XuB46EsxqwIX': ForkedLightning,
    '-LE68rplHU9ntql53T4q': MinorHealing
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
            //TODO this overwrites the original game objects from the original request.  The problem is that the response from the original request returns this value
            //It needs to

            let queuePlayerCharacter = new Character(gameObjects.game.state, eachActionToProcess.player_character_id);
            //gameObjects.playerCharacter = new Character(gameObjects.game.state, eachActionToProcess.player_character_id);
            gameObjects.requestZone = new Zone(gameObjects.game.state, eachActionToProcess.channel_id);

            if (eachActionToProcess.target_character_id) {
                gameObjects.targetCharacter = new Character(gameObjects.game.state, eachActionToProcess.target_character_id);
            } else {
                gameObjects.targetCharacter = {};
            }

            //Declare the Class function without invoking
            const actionObjectToMake = actionControllers[gameObjects.actionTaken.id];

            validateGameObjects(gameObjects, [
                'game',
                'playerCharacter',
                'requestZone',
                'currentMatch',
                'actionTaken',
                'targetCharacter'
            ]);

            let actionObject = new actionObjectToMake(gameObjects, queuePlayerCharacter);

            //Process the action by passing in the relative turn
            let actionResponse = actionObject.process(gameObjects.currentMatch.props.number_turns - eachActionToProcess.turn_initiated);

            //Check if action dealt damage for response action check.  If so, character struck can respond depending on action range
            if (actionResponse.damageDealt) {
                if (actionResponse.damageDealt.length > 0){
                    console.log('action dealt damage, processing response');
                    actionResponse.damageDealt.forEach(eachActionResponse=>{
                        console.log('character id damaged and will now respond: ', eachActionResponse.targetID);

                        //Character struck now responds
                        //Using a placeholder for now.  Should strike back use BaseAction or should the be unique functions?
                        let characterDamaged = new Character(gameObjects.game.state, eachActionResponse.targetID);

                        //Check if that character damaged has a strike_back property
                        if (characterDamaged.props.strike_back){

                            //Compare the action range to see if the character has that type in its strike_back property:
                            if (characterDamaged.props.strike_back[actionObject.actionTaken.props.range]){

                                //Calculate a strikeback score.
                                let strikeBackRoll = actionObject._getRandomIntInclusive(0, 100);
                                console.log(`[${characterDamaged}] rolled for strikeback, rolled a ${strikeBackRoll} compare to minimum of ${characterDamaged.props.strike_back[actionObject.actionTaken.props.range]}!`);

                                //Roll to see if the action successfully initiates a strikeback
                                if (strikeBackRoll <= characterDamaged.props.strike_back[actionObject.actionTaken.props.range]){
                                    console.log(`Strikeback succeeded!`);

                                    //Push a basic attack into the queue for processing.  It should process during this refresh
                                    //TODO in the future this action should be dynamic (depending on range)
                                    gameObjects.currentMatch.props.action_queue.push({

                                        //Push the action ID into the action queue
                                        //TODO remove hard coded basic melee
                                        "action_id": "-LALEuXn3oNVmTXAAvIL",
                                        "turn_initiated": gameObjects.currentMatch.props.number_turns,
                                        "channel_id": gameObjects.requestZone.props.channel_id,
                                        "player_character_id": characterDamaged.id,
                                        "target_character_id": gameObjects.playerCharacter.id
                                        //"player_character_id": gameObjects.playerCharacter.id,
                                        //"target_character_id": characterDamaged.id
                                    });
                                }
                            }
                        }
                    })
                }
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

};

module.exports = {
    actionQueue
};