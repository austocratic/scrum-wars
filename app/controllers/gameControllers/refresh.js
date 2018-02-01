"use strict";

const checkForCharacterDeath = require('./checkForCharacterDeath').checkForCharacterDeath;
const checkForVictory = require('./checkForVictory').checkForVictory;
const checkForNewTurn = require('./checkForNewTurn').checkForNewTurn;
const checkForMatchStart = require('./checkForMatchStart').checkForMatchStart;
const processOngoingEffects = require('./processOngoingEffects').processOngoingEffects;

const actionQueue = require('../../controllers/gameControllers/actionQueue').actionQueue;

const validateGameObjects = require('../../helpers').validateGameObjects;

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

            /* I used to declare this, testing to see if I still need to
            let gameObjects = {
                game: this,
                currentMatch: new Match(this.state, this.getCurrentMatchID()),
                slackResponseTemplate: {}
            };*/

            //Create an array of characters in the zone
            let charactersInZone = gameObjects.currentMatch.props.starting_character_ids.map(eachStartingCharacterID=>{
                return new Character(gameObjects.game.state, eachStartingCharacterID)
            });

            //Process ongoing effects
            processOngoingEffects(gameObjects, charactersInZone);

            //Process the action Queue
            actionQueue(gameObjects);

            //Check for character deaths
            checkForCharacterDeath(gameObjects, charactersInZone);

            //Check for victory
            checkForVictory(gameObjects, charactersInZone);

            //Check for incrementing the turn
            checkForNewTurn(gameObjects);

            break;


        //If match has ended, create a new match and update the global match ID
        case 'ended':
            //Pass in old match zone when creating the new match
            let newMatchID = gameObjects.game.createMatch(gameObjects.currentMatch.props.zoneID);

            //Update the global state to new match id
            gameObjects.game.state.global_state.match_id = newMatchID;

            break;
    }


};


module.exports = {
    refresh
};