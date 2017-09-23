"use strict";

const updateCallback = require('../../helpers').updateCallback;
const validateGameObjects = require('../../helpers').validateGameObjects;


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
    let truncFileList;
    if (gameObjects.playerCharacter.props.gender === 'male'){
        truncFileList = gameObjects.game.maleAvatarPaths.slice(1, 6);
    }
    if (gameObjects.playerCharacter.props.gender === 'female'){
        truncFileList = gameObjects.game.femaleAvatarPaths.slice(1, 6);
    }

    gameObjects.slackResponseTemplate.attachments = truncFileList.map( eachFilePath =>{
        return {
            "text": "",
            "image_url": 'https://scrum-wars.herokuapp.com/' + eachFilePath,
            "fallback": 'A strange force prevents you from choosing an avatar, try again!',
            "actions":[{
                "name": "selection",
                "text": "Select",
                "style": "default",
                "type": "button",
                "value": eachFilePath
            }]
        }
    });

    //Add a more button to the attachment array
    gameObjects.slackResponseTemplate.attachments.push({
        "text": "",
        "image_url": '',
        "fallback": 'Button failed, try again!',
        "actions": [
            {
                "name": "more",
                "text": "More",
                "style": "default",
                "type": "button",
                "value": 6
            }
        ]
    });
    
    let updatedCallback = gameObjects.slackCallback + ':' + gameObjects.userActionValueSelection + '/avatarList';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;
};




module.exports = {
    genderSelection
};
