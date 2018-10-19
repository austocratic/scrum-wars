"use strict";

const checkForLevelAndLevelUp = require('../../helpers/characterHelpers').checkForLevelAndLevelUp;

const checkForCharacterLevelUp = (gameObjects) => {
    console.log('Info: called checkForCharacterLevelUp()');

    //Get all active characters
    let allCharacters = gameObjects.game.getCharacters();

    //Iterate characters, if they are active, check for leveling up
    allCharacters.forEach(eachCharacter=>{
        //If character is active, check for level up
        if(eachCharacter.props.active === 1){
            checkForLevelAndLevelUp(gameObjects, eachCharacter)
        }
    })   
};


module.exports = {
    checkForCharacterLevelUp
};

