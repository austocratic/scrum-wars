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

    let characterIDsInZone = gameObjects.game.getCharacterIDsInZone(gameObjects.requestZone.id);

    let filteredCharacterIDs =characterIDsInZone.filter( eachCharacterID =>{
        return eachCharacterID !== gameObjects.playerCharacter.id
    });

    gameObjects.slackResponseTemplate.attachments[0].actions[0].options = filteredCharacterIDs.map( singleCharacterID => {
        return {
            "text": gameObjects.game.state.character[singleCharacterID].name,
            //"style": "primary",
            //"type": "button",
            "value": singleCharacterID
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

    //Set the callback, will be assigned at end of switch
    let updatedCallback = gameObjects.slackCallback + ':' + gameObjects.userActionValueSelection + '/selectActionTarget';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;
};

module.exports = {
    getTargetSelectionMenu
};
