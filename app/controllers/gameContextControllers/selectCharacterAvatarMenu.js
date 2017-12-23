"use strict";

const updateCallback = require('../../helpers').updateCallback;
const validateGameObjects = require('../../helpers').validateGameObjects;

const more = gameObjects => {
    console.log('called function selectCharacterAvatarMenu/more');

    validateGameObjects(gameObjects, [
        'game', 
        'playerCharacter', 
        'userActionValueSelection',
        'slackResponseTemplate', 
        'slackCallback' 
    ]);

    //TODO hard coded +6 into pagination calculation.  Need to set via config variable
    let attachmentsPerPage = 6;

    let numericRequestActionValue = parseFloat(gameObjects.userActionValueSelection);

    //Determine the end of the current page (if more is selected, pass that as the next value
    let nextPaginationEnd = numericRequestActionValue + attachmentsPerPage;

    //Determine the beginning of the previous page (this will be used to determine starting point of previous page selection)
    let previousPaginationBegin = numericRequestActionValue - attachmentsPerPage;

    gameObjects.slackResponseTemplate = {
        'text': 'What does your character look like?',
        'attachments': []
    };
    
    let avatarFileNames, paginatedAvatarFileNames;
    if (gameObjects.playerCharacter.props.gender === 'male'){

        //Path array is reference later to determine whether or not to display paginate button
        avatarFileNames = gameObjects.game.maleAvatarFileNames;
        paginatedAvatarFileNames = avatarFileNames.slice(gameObjects.userActionValueSelection, nextPaginationEnd);
    }
    else if (gameObjects.playerCharacter.props.gender === 'female'){

        //Path array is reference later to determine whether or not to display paginate button
        avatarFileNames = gameObjects.game.femaleAvatarFileNames;
        paginatedAvatarFileNames = avatarFileNames.slice(gameObjects.userActionValueSelection, nextPaginationEnd);
    } else {
        gameObjects.slackResponseTemplate = {
            "text": "ERROR, you have not selected your gender yet"
        }
    }

    gameObjects.slackResponseTemplate.attachments = paginatedAvatarFileNames.map( eachPaginatedAvatarFileName =>{
        return {
            "text": "",
            "fallback": "Unable to select avatar",
            "image_url": gameObjects.game.baseURL + gameObjects.game.avatarPath + gameObjects.playerCharacter.props.gender + '/' + eachPaginatedAvatarFileName,
            //"image_url": 'https://scrum-wars.herokuapp.com/' + eachFilePath,
            "actions":[{
                "name": "selection",
                "text": "Select",
                "style": "default",
                "type": "button",
                "value": eachPaginatedAvatarFileName
            }]
        }
    });

    gameObjects.slackResponseTemplate.attachments.push({
        "text": "",
        "image_url": '',
        "fallback": "Unable to select avatar",
        "actions": []
    });

    //Get the index of the navigations buttins attachment so that buttons can be pushed into that index
    let navigationButtonAttachmentIndex = gameObjects.slackResponseTemplate.attachments.length - 1;

    //If there is at least one value between 0 and current page beginning, add a previous button
    //Add 'previous' button to the attachment array
    if (numericRequestActionValue > 0) {
        gameObjects.slackResponseTemplate.attachments[navigationButtonAttachmentIndex].actions.push(
            {
                "name": "more",
                "text": "Previous",
                "style": "default",
                "type": "button",
                "value": previousPaginationBegin
            }
        );
    }

    //If there is at least one value after the current page end, add a next button
    //Add 'more' button to the attachment array
    if (nextPaginationEnd < avatarFileNames.length) {
        gameObjects.slackResponseTemplate.attachments[navigationButtonAttachmentIndex].actions.push(
            {
                "name": "more",
                "text": "More",
                "style": "default",
                "type": "button",
                "value": nextPaginationEnd
            }
        );
    }

    //let updatedCallback = gameObjects.slackCallback;

    //gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}selectCharacterAvatarMenu`);

    //gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}`);

    return gameObjects.slackResponseTemplate;
};

const selection = gameObjects => {
    console.log('called function selectCharacterAvatarMenu/selection');

    validateGameObjects(gameObjects, [
        'userActionValueSelection',
        'slackResponseTemplate',
        'playerCharacter'
    ]);
    
    //store the file path in the character's profile
    gameObjects.playerCharacter.updateProperty('avatar', gameObjects.userActionValueSelection);

    gameObjects.slackResponseTemplate = {
        "text": "You prepare to set out on your journey, but first, what is your name? (type /name ___ to set your name)"
    };

    return gameObjects.slackResponseTemplate;
};


module.exports = {
    more,
    selection
};