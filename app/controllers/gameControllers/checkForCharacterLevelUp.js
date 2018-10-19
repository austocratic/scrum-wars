"use strict";

const checkForLevelAndLevelUp = require('../../helpers/characterHelpers').checkForLevelAndLevelUp;

const checkForCharacterLevelUp = (gameObjects) => {
    console.log('Info: called checkForCharacterLevelUp()');

    //Get all active characters
    let allCharacters = gameObjects.game.getCharacters();

    //filter for active characters only
    let activeCharacters = allCharacters.filter(eachCharacter=>eachCharacter.props.active === 1)

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

