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
            strength: 5,
            toughness: 12
        };

        //Argument: modifiers object
        testCharacter.setModifiedStats(testPropertiesToModify);

        it("stats_current.strength should equal stats_base.strength + testPropertiesToModify.strength", function(){
            assert.equal(testCharacter.props.stats_current['strength'], testCharacter.props.stats_base['strength'] + testPropertiesToModify.strength)
        });
    })
});
