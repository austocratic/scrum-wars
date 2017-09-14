
const updateCallback = require('../../helpers').updateCallback;


const yes = gameObjects => {
    console.log('called function generateCharacterConfirmation/yes');

    //If the user has a character, inactivate it
    if (gameObjects.playerCharacter.props !== undefined){
        gameObjects.playerCharacter.inactivate();
    }
    
    //Create new character record
    let newPlayerCharacterID = gameObjects.game.createCharacter(gameObjects.user.id);

    //Update the user to new character
    gameObjects.user.updateProperty('character_id', newPlayerCharacterID);

    //Return a class selection template with all available classes from the DB
    gameObjects.slackResponseTemplate = gameObjects.game.getCharacterClasses();

    let updatedCallback = gameObjects.slackCallback + ':yes/characterClassList';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;
};

const no = gameObjects => {
    console.log('slackRequest called function generateCharacterConfirmation/no');

    gameObjects.slackResponseTemplate.text = "You decide to continue your journey with your current character";

    return gameObjects.slackResponseTemplate
};


module.exports = {
    yes,
    no
};
