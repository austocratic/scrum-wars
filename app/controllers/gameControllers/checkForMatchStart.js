"use strict";

const slack = require('../../libraries/slack').sendMessage;


const checkForMatchStart = (gameObjects) => {
    console.log('called checkForMatchStart()');

    let currentDate = new Date();

    let currentHour = currentDate.getUTCHours();

    console.log('currentHour: ', currentHour);
    console.log('gameObjects.game.matchStartTime: ', gameObjects.game.matchStartTime);

    //*************** CHECK FOR MATCH START *****************
    if (currentHour > gameObjects.game.matchStartTime){
        console.log('Time to start the match!');

        //TODO get all the characters currently in the zone

        gameObjects.currentMatch.start(gameObjects.game.getCharacterIDsInZone(gameObjects.currentMatch.props.zone_id));

        let alertDetails = {
            "username": "A mysterious voice",
            "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
            //TODO dont hardcode the arena
            "channel": ("#arena"),
            "text": "Prepare for battle! The match begins!"
        };

        slack(alertDetails);
    }
};




module.exports = {
    checkForMatchStart
};

