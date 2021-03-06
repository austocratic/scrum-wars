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

        describe("calling method getEffectsWithModifier", function(){

            describe("with an empty array parameter", function(){
                it("should return an empty array", function(){
                    assert.equal(testCharacter.getEffectsWithModifier([]).length, 0)
                })
            });

            describe("and contains another effect with is_hidden", function(){

                testCharacter.props.effects = [{
                    "action_id" : "hidden_effect_id",
                    "applied_by_character_id" : "cd3addd0cb0bb7611e8b",
                    "modifiers" : {
                        "is_hidden" : 1
                    },
                    "type" : "special"
                },{
                    "action_id" : "ice_effect_id",
                    "applied_by_character_id" : "cd3addd0cb0bb7611e8b",
                    "modifiers" : {
                        "is_frozen" : 1,
                        "is_hidden" : 1
                    },
                    "type" : "special"
                },
                {
                    "action_id" : "another_effect",
                    "applied_by_character_id" : "cd3addd0cb0bb7611e8b",
                    "type" : "special"
                }];


                it("should return an array with 2 elements", function(){
                    assert.equal(testCharacter.getEffectsWithModifier('is_hidden').length, 2)
                })
            })

        });

        describe("calling method resetActions", function(){

            let resetActionsTestCharacter = new Character(game.state, '-Kkxf1ukVSF9VV6mIPlG');

            //Set the characters actions to be reset
            resetActionsTestCharacter.props.actions = [{
                "action_id": "first_test_action",
                "turn_used": 500
            }];

            resetActionsTestCharacter.resetActions();

            it("should change the actions in the array .turn_used property to 0", function(){

                //console.log('DEBUG testCharacter.props.actions: ', testCharacter.props.actions[0].turn_used);

                assert.equal(resetActionsTestCharacter.props.actions[0].turn_used, 0)
            })
        });

        describe("calling method getEquipmentInSlot", function(){

            //console.log('items in slot: ', testCharacter.getEquipmentInSlot('-KmTV24FelP7T8rdKLEx'));

            console.log('items in slot: ', testCharacter.getEquipmentInSlot('banana'));
        })

        describe("testing incrementProperty()", function(){

            console.log('testCharacter.props: ', testCharacter.props);

            it("should increment the character's gold by 5", function(){

                let oldGold = testCharacter.props.gold;

                testCharacter.incrementProperty('gold', 5);

                assert.equal(oldGold + 5, testCharacter.props.gold)
            });

            it("should increment the character's stats_current.hit_points by 10", function(){

                let oldhit_points = testCharacter.props.stats_current.hit_points;

                testCharacter.incrementProperty('stats_current.hit_points', 10);

                assert.equal(oldhit_points + 10, testCharacter.props.stats_current.hit_points)
            });

        })
    });
});
