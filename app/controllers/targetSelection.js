"use strict";

const updateCallback = require('../helpers').updateCallback;

const getTargetSelectionMenu = gameObjects => {

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

    console.log('DEBUG getTargetSelectionMenu charactersInZone: ', charactersInZone);

    let filteredCharacters = charactersInZone
        //Filter out the player's character
        .filter( eachCharacter =>{

            console.log('DEBUG getTargetSelectionMenu eachCharacter 1: ', eachCharacter);

            return eachCharacter !== gameObjects.playerCharacter.id
        })
        //Filter out hidden characters
        .filter( eachCharacter => {

            console.log('DEBUG getTargetSelectionMenu eachCharacter 2: ', eachCharacter);

            return eachCharacter.props.is_hidden === 0
        });

    console.log('DEBUG getTargetSelectionMenu filteredCharacters: ', filteredCharacters);


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
