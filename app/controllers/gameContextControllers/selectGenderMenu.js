"use strict";

const updateCallback = require('../../helpers/helpers').updateCallback;
const validateGameObjects = require('../../helpers/helpers').validateGameObjects;


const genderSelection = gameObjects => {
    console.log('called function selectGenderMenu/genderSelection');

    validateGameObjects(gameObjects, [
        'game',
        'userActionValueSelection',
        'playerCharacter',
        'slackResponseTemplate', 
        'slackCallback' 
    ]);

    //Mutate the object
    gameObjects.playerCharacter.updateProperty('gender', gameObjects.userActionValueSelection);

    //Create the first page of the avatar menu
    gameObjects.slackResponseTemplate.text = 'What does your character look like?';
    
    //TODO hard coded first page length with .slice(1, 6), need to move to config
    let avatarFileNames;
    if (gameObjects.playerCharacter.props.gender === 'male'){
        avatarFileNames = gameObjects.game.maleAvatarFileNames.slice(1, 6);
    }
    if (gameObjects.playerCharacter.props.gender === 'female'){
        avatarFileNames = gameObjects.game.femaleAvatarFileNames.slice(1, 6);
    }

    gameObjects.slackResponseTemplate.attachments = avatarFileNames.map( eachAvatarFileName =>{
        return {
            "text": "",
            "image_url": gameObjects.game.baseURL + gameObjects.game.avatarPath + gameObjects.playerCharacter.props.gender + '/' + eachAvatarFileName,
            "color": gameObjects.game.menuColor,
            "fallback": 'A strange force prevents you from choosing an avatar, try again!',
            "actions":[{
                "name": "selection",
                "text": "Select",
                "style": "default",
                "type": "button",
                "value": eachAvatarFileName
            }]
        }
    });

    //Add a more button to the attachment array
    gameObjects.slackResponseTemplate.attachments.push({
        "text": "",
        "image_url": '',
        "fallback": 'Button failed, try again!',
        "color": gameObjects.game.menuColor,
        "actions": [
            {
                "name": "paginate",
                "text": "More",
                "style": "default",
                "type": "button",
                "value": 6
            }
        ]
    });

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}selectCharacterAvatarMenu`);

    return gameObjects.slackResponseTemplate;
};




module.exports = {
    genderSelection
};
