
const updateCallback = require('../../helpers/helpers').updateCallback;
const validateGameObjects = require('../../helpers/helpers').validateGameObjects;


const yes = gameObjects => {
    console.log('called function generateCharacterConfirmation/yes');

    validateGameObjects(gameObjects, [
        'game',
        'user',
        'slackResponseTemplate'
    ]);

    //If the user has a character, inactivate it
    if (gameObjects.playerCharacter){
        gameObjects.playerCharacter.inactivate();
    }
    
    //Create new character record
    let newPlayerCharacterID = gameObjects.game.createCharacter(gameObjects.user.id);

    //Update the user to new character
    gameObjects.user.updateProperty('character_id', newPlayerCharacterID);

    gameObjects.slackResponseTemplate = {};
    
    let characterClasses = gameObjects.game.getCharacterClasses();

    gameObjects.slackResponseTemplate.attachments = characterClasses
        .map( eachCharacterClass => {
            return {
                "title": eachCharacterClass.props.name,
                "fallback": "You are unable to choose an action",
                "callback_id": "",
                "color": gameObjects.game.menuColor,
                "attachment_type": "default",
                "image_url": "https://scrum-wars.herokuapp.com/public/images/fullSize/" + eachCharacterClass.props.image_id + ".png",
                "fields": [{
                    "title": "Description",
                    "value": eachCharacterClass.props.description,
                    "short": false
                }],
                "actions": [{
                    "name": 'classSelection',
                    "text": `Choose ${eachCharacterClass.props.name}`,
                    "style": "default",
                    "type": "button",
                    "value": eachCharacterClass.id
                },
                {
                    "name": 'classDetailMenu',
                    "text": 'More information',
                    "style": "default",
                    "type": "button",
                    "value": eachCharacterClass.id
                }]
            };
    });

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}selectCharacterClassMenu`);

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
