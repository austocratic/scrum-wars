"use strict";




const checkForNewTurn = (gameObjects) => {
    console.log('called checkForNewTurn()')


    //*************** CHECK FOR TURN INCREMENT *****************

    //console.log('currentMatch.props.date_started: ', currentMatch.props.date_started);

    //Calculate the time that the next turn should start:
    let nextTurnStartTime = (gameObjects.currentMatch.props.date_started + (gameObjects.currentMatch.props.number_turns * (gameObjects.game.turnLengthMinutes * 60000)));

    console.log('nextTurnStartTime: ', nextTurnStartTime);

    let humanTime = new Date(nextTurnStartTime);

    console.log('nextTurnStartTime: ', humanTime.toTimeString());

    console.log("Current time: ", Date.now());

    //Test if turn should be incremented
    if (Date.now() > nextTurnStartTime){
        //Increase the match turn property
        gameObjects.currentMatch.incrementTurn();

        //What is this for?
        //let gameCharacters = this.getCharacters();

    }

};




module.exports = {
    checkForNewTurn
};

