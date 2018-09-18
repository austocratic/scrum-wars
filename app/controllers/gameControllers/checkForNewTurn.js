"use strict";

const slack = require('../../libraries/slack').sendMessage;



const checkForNewTurn = (gameObjects) => {
    console.log('Info: called checkForNewTurn()');

    //*************** CHECK FOR TURN INCREMENT *****************

    //console.log('currentMatch.props.date_started: ', currentMatch.props.date_started);

    //Calculate the time that the next turn should start based on when the game started, # of turns * the length of the turns
    let nextTurnStartTime = (gameObjects.currentMatch.props.date_started + (gameObjects.currentMatch.props.number_turns * (gameObjects.game.turnLengthMinutes * 60000)));

    //console.log('nextTurnStartTime: ', nextTurnStartTime);

    let humanTime = new Date(nextTurnStartTime);

    //console.log('nextTurnStartTime: ', humanTime.toTimeString());

    //console.log("Current time: ", Date.now());

    //Test if turn should be incremented
    if (Date.now() > nextTurnStartTime){
        //Increase the match turn property
        gameObjects.currentMatch.incrementTurn();

        slack({
            "username": gameObjects.arenaZone.props.zone_messages.name,
            "icon_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + gameObjects.arenaZone.props.zone_messages.image + '.bmp',
            "channel": ("#" + gameObjects.arenaZone.props.channel),
            "attachments": [{
                "text": "_A new turn begins!_",
                "color": gameObjects.game.menuColor
            }]
        });
    }

};




module.exports = {
    checkForNewTurn
};

