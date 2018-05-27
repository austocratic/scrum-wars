"use strict";

const updateCallback = require('../helpers').updateCallback;

const getTargetSelectionMenu = gameObjects => {
    console.log('called targetSelection/getTargetSelectionMenu');


    gameObjects.slackResponseTemplate = {
        "attachments": [
            {
                "text": "",
                "callback_id": "",
                "fallback": "unable to select an option",
                "actions": [
                    {
                        "name": "processActionOnTarget",
                        "text": "Select a target",
                        "type": "select",
                        "options": []
                    }]
            }]
    };

    //let characterIDsInZone = gameObjects.game.getCharacterIDsInZone(gameObjects.requestZone.id);
    let charactersInZone = gameObjects.game.getCharactersInZone(gameObjects.requestZone.id);

    //Get an array of the character IDs on the character's team (including the player)
    let characterIDsOnTeam = gameObjects.game.getCharacterIDsOnTeam(gameObjects.playerCharacter.id);

    let filteredCharacters = charactersInZone
        //Filter out the player's team (including the player's character)
        .filter( eachCharacter =>{

            //Only include characters that are not in the characterIDsOnTeam array
            return characterIDsOnTeam.indexOf(eachCharacter.id) === -1;

            //return eachCharacter.id !== gameObjects.playerCharacter.id
        })
        //Filter out hidden characters
        .filter( eachCharacter => {
            //return eachCharacter.getEffectsWithModifier('is_hidden').length === 0;
            return eachCharacter.props.stats_current.is_hidden === 0;
        });

    gameObjects.slackResponseTemplate.attachments[0].actions[0].options = filteredCharacters.map( eachCharacter => {
        return {
            "text": eachCharacter.props.name,
            //"text": gameObjects.game.state.character[singleCharacterID].name,
            "value": eachCharacter.id
        }
    });

    //Add a back button
    gameObjects.slackResponseTemplate.attachments.push({
        "fallback": "unable to go back",
        "actions": [{
            "name": "back",
            "text": "Back",
            "fallback": "unable to go back",
            "type": "button",
            "value": "no"
        }]
    });

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}selectActionTarget`);

    return gameObjects.slackResponseTemplate;
};

module.exports = {
    getTargetSelectionMenu
};
