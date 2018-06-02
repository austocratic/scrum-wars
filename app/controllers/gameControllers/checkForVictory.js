"use strict";

const slack = require('../../libraries/slack').sendMessage;


const checkForVictory = (gameObjects, charactersInZone) => {
    console.log('called checkForVictory()');

    //TODO currently a single refresh will not detect that players are dead and declare one as the winner
    //It will move dead characters in one refresh and declare the winner in the next refresh
    //Check for only one character left in zone (victory condition)
    if (charactersInZone.length === 1) {

        //Last character Object is the winner.  Create reference for ease of use
        let winningCharacter = charactersInZone[0];

        //Reward the winning character
        //TODO come up with randomization function for arena gold reward
        let arenaReward = 10;

        //Notify Slack about the winner
        slack({
            "username": gameObjects.requestZone.props.zone_messages.name,
            "icon_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + gameObjects.requestZone.props.zone_messages.image + '.bmp',
            //TODO dont hardcode the arena
            "channel": ("#arena"),
            "attachments": [{
                "text": `We have a winner! ${winningCharacter.props.name} emerges victorious from the battle!
                \n${winningCharacter.props.name}'s receives today's prize of ${arenaReward} gold!`,
                "color": gameObjects.game.menuColor
            }]
        });

        //Increment that players win count
        winningCharacter.incrementProperty('match_wins', 1);

        //Increment that players win count
        winningCharacter.incrementProperty('gold', arenaReward);

        gameObjects.currentMatch.end(winningCharacter.id)
    }
};




module.exports = {
    checkForVictory
};

