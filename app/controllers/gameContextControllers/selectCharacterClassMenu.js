"use strict";

const updateCallback = require('../../helpers').updateCallback;
const validateGameObjects = require('../../helpers').validateGameObjects;

const Class = require('../../models/Class').Class;


const classSelection = gameObjects => {
    console.log('called function selectCharacterClassMenu/classSelection');

    validateGameObjects(gameObjects, [
        'game',
        'userActionValueSelection',
        'playerCharacter',
        'slackResponseTemplate',
        'slackCallback'
    ]);
    
    gameObjects.characterClass = new Class(gameObjects.game.state, gameObjects.userActionValueSelection);
    
    //Validate that required gameObjects are passed in before attempting to reference
    validateGameObjects(gameObjects, [
        'characterClass'
    ]);

    // *****************Based on class selection update DB stats*******************

    //Array of action IDs
    let characterActions = gameObjects.characterClass.props.action_id.map( eachActionID =>{
        return {
            action_id: eachActionID,
            turn_used: 0
        }
    });

    //Mutate the object - combine these 3 calls?
    Object.assign(gameObjects.playerCharacter.props, {
        actions: characterActions,
        class_id: gameObjects.characterClass.id
    });
    Object.assign(gameObjects.playerCharacter.props.stats_base, gameObjects.characterClass.props.starting_attributes);
    //This is only necessary because the refresh mechanic depends on the .stats_current properties each existing before updating
    Object.assign(gameObjects.playerCharacter.props.stats_current, gameObjects.characterClass.props.starting_attributes);


    /*
    Object.assign(gameObjects.playerCharacter.props.stats_base, {
        strength: gameObjects.characterClass.props.starting_attributes.strength,
        toughness: gameObjects.characterClass.props.starting_attributes.toughness,
        dexterity: gameObjects.characterClass.props.starting_attributes.dexterity,
        intelligence: gameObjects.characterClass.props.starting_attributes.intelligence
    });
    Object.assign(gameObjects.playerCharacter.props.stats_current, {
        strength: gameObjects.characterClass.props.starting_attributes.strength,
        toughness: gameObjects.characterClass.props.starting_attributes.toughness,
        dexterity: gameObjects.characterClass.props.starting_attributes.dexterity,
        intelligence: gameObjects.characterClass.props.starting_attributes.intelligence
    });*/

    // *****************Return the gender selection menu*******************

    gameObjects.slackResponseTemplate = {
        "attachments": [
            {
                "text": "Select a character gender",
                "fallback": "You are unable to go back",
                "callback_id": "genderList",
                "color": gameObjects.game.menuColor,
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "genderSelection",
                        "text": "Male",
                        "style": "",
                        "type": "button",
                        "value": "male"
                    },
                    {
                        "name": "genderSelection",
                        "text": "Female",
                        "style": "",
                        "type": "button",
                        "value": "female"
                    }
                ]
            }]
    };

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}selectGenderMenu`);

    return gameObjects.slackResponseTemplate;
};

const classDetailMenu = gameObjects => {
    console.log('called function selectCharacterClassMenu/classDetail');

    validateGameObjects(gameObjects, [
        'game',
        'userActionValueSelection',
        'playerCharacter',
        'slackResponseTemplate',
        'slackCallback'
    ]);

    gameObjects.characterClass = new Class(gameObjects.game.state, gameObjects.userActionValueSelection);

    //Validate that required gameObjects are passed in before attempting to reference
    validateGameObjects(gameObjects, [
        'characterClass'
    ]);

    //Create an item detail view template
    gameObjects.slackResponseTemplate = gameObjects.characterClass.getDetailView();

    //Add a back button
    gameObjects.slackResponseTemplate.attachments.push({
        "fallback": "unable to go back",
        "color": gameObjects.game.menuColor,
        "actions": [{
            "name": "back",
            "text": "Back",
            "fallback": "unable to go back",
            "type": "button",
            "value": "back"
        }]
    });

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}selectGenderMenu`);

    return gameObjects.slackResponseTemplate;
};




module.exports = {
    classSelection,
    classDetailMenu
};
