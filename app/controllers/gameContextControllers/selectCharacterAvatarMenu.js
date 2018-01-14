"use strict";

const updateCallback = require('../../helpers').updateCallback;
const validateGameObjects = require('../../helpers').validateGameObjects;

const paginate = gameObjects => {
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
                "name": "paginate",
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
                "name": "paginate",
                "text": "More",
                "style": "default",
                "type": "button",
                "value": nextPaginationEnd
            }
        );
    }

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}selectCharacterAvatarMenu`);

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

    gameObjects.slackResponseTemplate.attachments = [{
        "color": gameObjects.game.menuColor,
        "text":
            `After months of travel, your long caravan ride finally comes to an end. You have arrived at the capital city of Dal Garial. The cities skyline truly lives up to its reputation, its multitiered architecture ripe with fauna. You admire the cities magnificent towers which sprout up throughout the city like shoots of duniper grass.
            \nUpon entering through the southern gates, a man approaches you.  He carries the imperial sigil on his well maintained cuirass and an enormous feather plume arcs from his helmet, eclipsing the morning sun. The captain speaks to you, a heavy air of condescension on every word, “You there, all refugees must report to the application desk for assignment.  You’re lucky you arrived when you did. By royal decree, the gates are being sealed. No longer will our city be burdened by your kind
            \nYou follow a line of other beleaguered travels to register. You approach the registration desk and come upon an unnaturally thin man behind the desk flipping through a stack of parchment.  As you approach he begins to ask, “Name, name name, we don’t have all day.  State your name traveler.
            \n*_Type /name to set your character's name!_*`
    }];

    return gameObjects.slackResponseTemplate;
};


module.exports = {
    paginate,
    selection
};