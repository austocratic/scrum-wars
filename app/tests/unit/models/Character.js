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
        });

        describe("calling method getEffectsWithModifiers", function(){

            describe("with an empty array parameter", function(){
                it("should return an empty array", function(){
                    assert.equal(testCharacter.getEffectsWithModifiers([]).length, 0)
                })
            })

            //Add a hidden effect to testCharacter
            testCharacter.props.effects = [{
                "action_id" : "hidden_effect_id",
                "applied_by_character_id" : "cd3addd0cb0bb7611e8b",
                "modifiers" : {
                    "is_hidden" : 1
                },
                "type" : "special"
            }]

            describe("with an array parameter containing is_hidden", function(){

                it("should return an array with 1 element", function(){

                    //console.log('getEffects result: ', testCharacter.getEffectsWithModifiers(['is_hidden']))

                    assert.equal(testCharacter.getEffectsWithModifiers(['is_hidden']).length, 1)
                })
            });

            testCharacter.props.effects.push({
                "action_id" : "ice_effect_id",
                "applied_by_character_id" : "cd3addd0cb0bb7611e8b",
                "modifiers" : {
                    "is_frozen" : 1
                },
                "type" : "special"
            })

            it("should return an array with 2 elements", function(){

                //console.log('getEffects result: ', testCharacter.getEffectsWithModifiers(['is_hidden', 'is_frozen']))

                assert.equal(testCharacter.getEffectsWithModifiers(['is_hidden', 'is_frozen']).length, 2)
            })



        });





    });
});
