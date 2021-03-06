
const slack = require('../libraries/slack').sendMessage;
const validateGameObjects = require('./helpers').validateGameObjects;

const characterLevelUp = (gameObjects, characterToLevel) => {
    characterToLevel.incrementProperty('level', 1);

    validateGameObjects(gameObjects, [
        'game',
        'arenaZone'
    ]);

    console.log('DEBUG: arenaZone: ', JSON.stringify(gameObjects.arenaZone.props))
    console.log('DEBUG: characterToLevel: ', JSON.stringify(characterToLevel.props))

    //Notify Slack about level up!
    slack({
        "username": gameObjects.arenaZone.props.zone_messages.name,
        "icon_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + characterToLevel.props.avatar,
        //TODO dont hardcode the arena
        "channel": ("#arena"),
        "attachments": [{
            "text": `*${characterToLevel.props.name} grows stronger and reaches level ${characterToLevel.props.level}!*`
        }]
    });
}

const checkForLevelAndLevelUp = (gameObjects, characterEarning) => {
    //See what the XP required for next level would be.  Take current level
    let xpToLevel = gameObjects.game.state.settings.character.levels.experience_to_level[characterEarning.props.level]

    //See if current XP is greater than required
    if (characterEarning.props.experience >=  xpToLevel){
        console.log(`Info: a character (${characterEarning.props.name}) leveled!`);
        characterLevelUp(gameObjects, characterEarning)
    }
}

const earnExperienceAndCheckForLevel = (gameObjects, characterEarning, xpAmount) => {
    console.log("Info: called characterHelpers/earnExperienceAndCheckForLevel");

    //Add XP to the character
    characterEarning.incrementProperty('experience', xpAmount);

    checkForLevelAndLevelUp(gameObjects, characterEarning)
}




module.exports = {
    earnExperienceAndCheckForLevel,
    characterLevelUp,
    checkForLevelAndLevelUp
};
