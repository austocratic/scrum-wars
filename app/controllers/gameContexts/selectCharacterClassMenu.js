"use strict";

const updateCallback = require('../../helpers').updateCallback;
const validateGameObjects = require('../../helpers').validateGameObjects;


const classSelection = gameObjects => {
    console.log('called function selectCharacterClassMenu/classSelection');
    
    //Valiate that required gameObjects are passed in before attempting to reference
    validateGameObjects(gameObjects, [
        'characterClass',
        'playerCharacter',
        'slackResponseTemplate',
        'slackCallback'
    ]);

    // *****************Based on class selection update DB stats*******************

    //Array of action IDs
    let characterActions = gameObjects.characterClass.props.action_id.map( eachActionID =>{
        return {
            action_id: eachActionID,
            turn_used: 0,
            turn_available: 0,
            is_available: 1
        }
    });

    let updates = {
        "actions": characterActions,
        "class_id": gameObjects.characterClass.id,
        "strength": gameObjects.characterClass.props.starting_attributes.strength,
        "toughness": gameObjects.characterClass.props.starting_attributes.toughness,
        "dexterity": gameObjects.characterClass.props.starting_attributes.dexterity,
        "intelligence": gameObjects.characterClass.props.starting_attributes.intelligence,
        "modified_strength": gameObjects.characterClass.props.starting_attributes.strength,
        "modified_toughness": gameObjects.characterClass.props.starting_attributes.toughness,
        "modified_dexterity": gameObjects.characterClass.props.starting_attributes.dexterity,
        "modified_intelligence": gameObjects.characterClass.props.starting_attributes.intelligence
    };

    //Mutate the object
    Object.assign(gameObjects.playerCharacter.props, updates);

    // *****************Return the gender selection menu*******************

    gameObjects.slackResponseTemplate = {
        "attachments": [
            {
                "text": "Select a character gender",
                "fallback": "You are unable to go back",
                "callback_id": "genderList",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "male",
                        "text": "Male",
                        "style": "",
                        "type": "button",
                        "value": "male"
                    },
                    {
                        "name": "female",
                        "text": "Female",
                        "style": "",
                        "type": "button",
                        "value": "female"
                    }
                ]
            }]
    };
    
    let updatedCallback = gameObjects.slackCallback + ':' + gameObjects.userSelection + '/selectGenderMenu';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;
};




module.exports = {
    classSelection
};
