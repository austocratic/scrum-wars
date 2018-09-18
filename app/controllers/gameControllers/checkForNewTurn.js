"use strict";

const slack = require('../../libraries/slack').sendMessage;
const newTurn = require('../../helpers/turn/newTurn').newTurn;



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

        //New turn helper - increment turn and message via slack
        newTurn(gameObjects);
    }

};




module.exports = {
    checkForNewTurn
};

