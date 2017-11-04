"use strict";

const assert = require('assert');

const testDB = require('../../testDB');

const Game = require('../../../models/Game').Game;
const Character = require('../../../models/Character').Character;

let game = new Game();
game.state = testDB;


describe("Testing Character model", function() {

    describe(" testing method setModifiedStats", function(){

        let testCharacter = new Character(game.state, '55e38d23d842e50e9026');

        let testBaseProperties = {};

        let testPropertiesToModify = {
            modified_strength: 5,
            modified_toughness: 12
        };

        console.log('~~~~~~~DEBUG: modified_strength BEFORE: ', testCharacter.props.modified_strength);
        console.log('~~~~~~~DEBUG: modified_toughness BEFORE: ', testCharacter.props.modified_toughness);

        //Argument: modifiers object
        testCharacter.setModifiedStats(testPropertiesToModify);

        console.log('~~~~~~~DEBUG: modified_strength AFTER: ', testCharacter.props.modified_strength);
        console.log('~~~~~~~DEBUG: modified_toughness AFTER: ', testCharacter.props.modified_toughness);


    })


});
