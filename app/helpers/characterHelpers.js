
const slack = require('../libraries/slack').sendMessage;


const characterLevelUp = (gameObjects, characterToLevel) => {
    characterToLevel.incrementProperty('level', 1);

    //Notify Slack about level up!
    slack({
        "username": gameObjects.requestZone.props.zone_messages.name,
        "icon_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + characterToLevel.props.avatar,
        //TODO dont hardcode the arena
        "channel": ("#arena"),
        "attachments": [{
            "text": `${characterToLevel.props.name} grows stronger!
            \n*reaches level ${characterToLevel.props.level}!*`
        }]
    });
}

const checkForLevelAndLevelUp = (gameObjects, characterEarning) => {
    //See what the XP required for next level would be
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
