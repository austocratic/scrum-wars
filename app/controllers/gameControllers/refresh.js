"use strict";

const checkForCharacterDeath = require('./checkForCharacterDeath').checkForCharacterDeath;
const checkForVictory = require('./checkForVictory').checkForVictory;
const checkForNewTurn = require('./checkForNewTurn').checkForNewTurn;
const checkForMatchStart = require('./checkForMatchStart').checkForMatchStart;
const processOngoingEffects = require('./processOngoingEffects').processOngoingEffects;

const actionQueue = require('../../controllers/gameControllers/actionQueue').actionQueue;
const validateGameObjects = require('../../helpers').validateGameObjects;

const Character = require('../../models/Character').Character;

//Invoked to refresh the game

const refresh = (gameObjects) => {
    console.log('refresh controller called');

    validateGameObjects(gameObjects, [
        'game',
        'currentMatch'
    ]);

    //Read the match status & determine needed update
    switch(gameObjects.currentMatch.props.status) {

        //If match is pending, determine if a match starting alert should be sent
        case 'pending':
            console.log('currentMatch.props.status = pending');

            //Determine if the match should start & start
            checkForMatchStart(gameObjects);

            break;

        //If match has started, determine if turn should be incremented or determine if game has hit end condition
        case 'started':
            console.log('Called game.refresh() currentMatch.props.status = started');

            let matchStartingCharacterIDs = gameObjects.currentMatch.getStartingCharacterIDs();

            //If no characters in the zone, end the match
            if (matchStartingCharacterIDs.length === 0) {
                gameObjects.currentMatch.end()
            }

            //let charactersInZone = gameObjects.game.getCharactersInZone(gameObjects.requestZone.id);

            //TODO should only check the arena zone for victory
            const charactersInArena = gameObjects.game.getCharactersInArena();

            console.log('DEBUG charactersInArena: ', charactersInArena);

            //Process ongoing effects
            processOngoingEffects(gameObjects, charactersInArena);

            //Process the action Queue
            actionQueue(gameObjects);

            //Check for character deaths
            checkForCharacterDeath(gameObjects, charactersInArena);

            //Check for victory
            checkForVictory(gameObjects, charactersInArena);

            //Check for incrementing the turn
            checkForNewTurn(gameObjects);

            break;


        //If match has ended, create a new match and update the global match ID
        case 'ended':
            //Pass in old match zone when creating the new match
            let newMatchID = gameObjects.game.createMatch(gameObjects.currentMatch.props.zone_id);

            //Set the global_state to the current match ID (which will soon be updated to the new ID)
            gameObjects.game.state.global_state.last_match_id = gameObjects.currentMatch.id;

            //Update the global state to new match id
            gameObjects.game.state.global_state.match_id = newMatchID;

            break;
    }


};


module.exports = {
    refresh
};