"use strict";

const slack = require('../../libraries/slack').sendMessage;


const checkForVictory = (gameObjects, charactersInZone) => {

    //TODO currently a single refresh will not detect that players are dead and declare one as the winner
    //It will move dead characters in one refresh and declare the winner in the next refresh
    //Check for only one character left in zone (victory condition)
    if (charactersInZone.length === 1) {

        //Last character Object is the winner.  Create reference for ease of use
        let winningCharacter = charactersInZone[0];

        //Notify Slack about the winner
        slack({
            "username": "Arena Announcer",
            "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
            //TODO dont hardcode the arena
            "channel": ("#arena"),
            "text": `We have a winner!  Congratulations ${winningCharacter.props.name}`
        });

        //Increment that players win count
        winningCharacter.incrementProperty('arena_wins', 1);

        //Reward the winning character
        //TODO come up with randomization function for arena gold reward
        let arenaReward = 10;

        //Increment that players win count
        winningCharacter.incrementProperty('gold', arenaReward);

        gameObjects.currentMatch.end(winningCharacter.id)
    }
};




module.exports = {
    checkForVictory
};

