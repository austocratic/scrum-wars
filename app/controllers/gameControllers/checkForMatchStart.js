"use strict";

const slack = require('../../libraries/slack').sendMessage;
const _ = require('lodash');
const moment = require('moment');
moment().format();


const checkForMatchStart = (gameObjects) => {
    console.log('called checkForMatchStart()');

    //Local time
    let currentDate = new moment();
    //console.log('currentDate: ', currentDate);

    //Convert to local
    let currentDateLocal = currentDate.subtract(8, 'hours');

    //console.log('currentDateLocal: ', currentDateLocal);

    //let currentHour = currentDate.getHours();
    //let currentDay = currentDate.getDay();
    let currentHour = currentDateLocal.hour();
    let currentDay = currentDate.day();

    //console.log('currentHour: ', currentHour);
    //console.log('currentDay: ', currentDay);

    //Check if the most recent match was already started today
    if(gameObjects.lastMatch.props.date_started){
        let lastMatchStartDate = new moment(gameObjects.lastMatch.props.date_started);

        //Convert the startDate to PST and remove time portion
        let lastMatchStartLocalDateOnly = lastMatchStartDate.subtract(8, 'hours').format("YYYY-MM-DD");

        let currentDateLocalDateOnly = currentDateLocal.format("YYYY-MM-DD");

        console.log(`Checking if a match already started, does ${lastMatchStartLocalDateOnly} equal ${currentDateLocalDateOnly} ?`);
        if (lastMatchStartLocalDateOnly === currentDateLocalDateOnly){
            console.log('Dont start match, another match already started today');
            return
        }
    }

    //If today does not have active flag or is undefined, escape
    if(_.get(gameObjects, `game.state.match.settings.schedule[${currentDay}].active`, 0) === 0){
        console.log('Did not start the match because currentDay is not active or undefined');
        return;
    }

    if (!_.has(gameObjects, `game.state.match.settings.schedule[${currentDay}].start_hour`)) {
        throw new Error('match schedule schedule is active for today but has no start time defined')
    }

    //Check if current hour is less than the scheduled start hour, if so escape
    if (currentHour < gameObjects.game.state.match.settings.schedule[currentDay].start_hour) {
        console.log(`Current hour ${currentHour} is less than start hour ${gameObjects.game.state.match.settings.schedule[currentDay].start_hour}, don't start`);
        return;
    }

    //Start the match
    gameObjects.currentMatch.start(gameObjects.game.getCharacterIDsInZone(gameObjects.currentMatch.props.zone_id));

    //Determine what type of match it is in order to announce it

    //Notify of match start
    slack({
        "username": gameObjects.requestZone.props.zone_messages.name,
        "icon_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + gameObjects.requestZone.props.zone_messages.image + '.bmp',
        //TODO dont hardcode the arena
        "channel": ("#arena"),
        "attachments": [{
            "text": "Prepare for battle! The match begins!",
            "color": gameObjects.game.menuColor
        }]
    });
};




module.exports = {
    checkForMatchStart
};

