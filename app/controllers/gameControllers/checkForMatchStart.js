"use strict";

const slack = require('../../libraries/slack').sendMessage;
const _ = require('lodash');


const checkForMatchStart = (gameObjects) => {
    console.log('called checkForMatchStart()');

    //Local time
    let currentDate = new Date();
    console.log('currentDate: ', currentDate);
    let currentHour = currentDate.getHours();
    let currentDay = currentDate.getDay();

    console.log('currentHour: ', currentHour);
    console.log('gameObjects.game.state.global_settings.match.schedule[currentDay].start_hour: ', gameObjects.game.state.global_settings.match.schedule[currentDay].start_hour);

    //If today does not have active flag or is undefined, escape
    if(_.get(gameObjects, `game.state.global_settings.match.schedule[${currentDay}].active`, 0) === 0){
        console.log('Did not start the match because currentDay is not active or undefined');
        return;
    }

    if (!_.has(gameObjects, `game.state.global_settings.match.schedule[${currentDay}].start_hour`)) {
        throw new Error('global_settings.match.schedule is active for today but has no start time defined')
    }

    //Check if current hour is greater than the scheduled start hour
    if (currentHour > gameObjects.game.state.global_settings.match.schedule[currentDay].start_hour){
        console.log('Time to start the match!');

        gameObjects.currentMatch.start(gameObjects.game.getCharacterIDsInZone(gameObjects.currentMatch.props.zone_id));

        let alertDetails = {
            "username": gameObjects.requestZone.props.zone_messages.name,
            "icon_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + gameObjects.requestZone.props.zone_messages.image + '.bmp',
            //TODO dont hardcode the arena
            "channel": ("#arena"),
            "attachments": [{
                "text": "Prepare for battle! The match begins!",
                "color": gameObjects.game.menuColor
            }]
        };

        slack(alertDetails);
    }
};




module.exports = {
    checkForMatchStart
};

