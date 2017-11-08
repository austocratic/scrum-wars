"use strict";

const assert = require('assert');

const testDB = require('../../testDB');

const Game = require('../../../models/Game').Game;
const Character = require('../../../models/Character').Character;

let game = new Game();
game.state = testDB;


describe("Testing Character model", function() {

    describe("instantiating new Character", function(){

        let testCharacter = new Character(game.state, '55e38d23d842e50e9026');

        it("should not be undefined", function(){
            assert(testCharacter)
        });

        describe("calling method setModifiedStats", function(){

            let testPropertiesToModify = {
                strength: 5,
                toughness: 12
            };

            //Argument: modifiers object
            testCharacter.setModifiedStats(testPropertiesToModify);

            it("stats_current.strength should equal stats_base.strength + testPropertiesToModify.strength", function(){
                assert.equal(testCharacter.props.stats_current['strength'], testCharacter.props.stats_base['strength'] + testPropertiesToModify.strength)
            });
        });

        describe("calling method updateActionUsed", function(){
            testCharacter.updateActionUsed('-Kjpe29q_fDkJG-73AQO', 3);

            it("should update the test character's action -Kjpe29q_fDkJG-73AQO turn_used property to 3", function(){
                assert.equal(testCharacter.props.actions[0].turn_used, 3)
            })
        })
    });
});
