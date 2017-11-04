"use strict";

const assert = require('assert');
const _ = require('lodash');
const BaseAction = require('../../../../../../app/controllers/actionControllers/baseActions/BaseAction').BaseAction;
const Character = require('../../../../../../app/models/Character').Character;
const Game = require('../../../../../../app/models/Game').Game;
const Action = require('../../../../../../app/models/Action').Action;
const Match = require('../../../../../../app/models/Match').Match;
const Zone = require('../../../../../../app/models/Zone').Zone;
const testDB = require('../../../../testDB');

let game = new Game();
game.state = testDB;


describe("Testing BaseAction class", function() {

    describe("testing instantiating it", function () {

        //Add a match for this test
        game.state.match['testingMatch'] = {
            "character_id_won" : 0,
            "date_ended" : 0,
            "date_started" : 0,
            "number_turns" : 1,
            "starting_character_ids" : [
                '-Kkxf1ukVSF9VV6mIPlG',
                '55e38d23d842e50e9026',
                '5bdfe1adfef85f3af257'
            ],
            "zone_id" : '-Khu9Ti4cn9PQ2Q1TSBT'
        };

        let gameObjects = {
            slackResponseTemplate: {},
            targetCharacter: new Character(game.state, '-Kkxf1ukVSF9VV6mIPlG'), //Freddy
            playerCharacter: new Character(game.state, '55e38d23d842e50e9026'), //Test wizard
            requestZone: new Zone(game.state, 'C4Z7F8XMW'), //arena
            currentMatch: new Match(game.state, 'testingMatch'),
            game,
            slackCallback: 'command:action/selectActionMenu:-Kjpe29q_fDkJG-73AQO/selectActionTarget',
            //TODO the below action ID is not for forken lightning because I have not set it up yet
            actionTaken: new Action(game.state, '-Kjpe29q_fDkJG-73AQO')
        };

        let testBaseAction = new BaseAction(gameObjects);

        it("should not be undefined", function () {
            assert(testBaseAction);
        });

        describe("testing BaseAction method _getRandomTarget", function () {

            describe("when passing an empty eachTargetToExclude", function () {
                let randomTargetObject = testBaseAction._getRandomTarget([]);

                it("should return an object", function (){
                    assert(typeof randomTargetObject === 'object');
                });
                it("should not return the playerCharacter", function (){
                    assert.notEqual(randomTargetObject, gameObjects.playerCharacter);
                })
            });

            describe("when passing an eachTargetToExclude array with 1 character objects", function () {
                let randomTargetObject = testBaseAction._getRandomTarget([
                    {
                        id: "5bdfe1adfef85f3af257",
                        props: {}
                    }
                ]);

                it("should return an object", function (){
                    assert(typeof randomTargetObject === 'object');
                });
                it("should not return the playerCharacter", function (){
                    assert.notEqual(randomTargetObject, gameObjects.playerCharacter);
                })
            });

            describe("when passing an eachTargetToExclude array with 2 character objects", function () {
                let randomTargetObject = testBaseAction._getRandomTarget([
                    {
                        id: "5bdfe1adfef85f3af257",
                        props: {}
                    },
                    {
                        id: "-Kkxf1ukVSF9VV6mIPlG",
                        props: {}
                    }
                ]);

                it("should return undefined", function (){
                    assert(randomTargetObject === undefined);
                });
                it("should not return the playerCharacter", function (){
                    assert.notEqual(randomTargetObject, gameObjects.playerCharacter);
                })
            })
        });

        describe("testing BaseAction method _incrementProperties", function () {

            //Modifiers to apply on action success
            let statsToModify = {
                modified_toughness: 8,
                modified_strength: -8
            };

            let toughnessBefore = gameObjects.targetCharacter.props.modified_toughness;
            let strengthBefore = gameObjects.targetCharacter.props.modified_strength;

            testBaseAction._incrementProperties(gameObjects.targetCharacter, statsToModify);

            it("updated modified_toughness should be " + statsToModify.modified_toughness + " greater than previous modified_toughness", function (){
                assert.equal(gameObjects.targetCharacter.props.modified_toughness, toughnessBefore + statsToModify.modified_toughness);
            });

            it("updated modified_strength should be " + statsToModify.modified_strength + " less than previous modified_strength", function (){
                assert.equal(gameObjects.targetCharacter.props.modified_strength, strengthBefore + statsToModify.modified_strength);
            })
        });

        describe("testing BaseAction method _reverseEffect", function () {

            let testEffect = {
                action_id: "test_action_id",
                applied_by_character_id: "someone",
                modifiers: {
                    modified_strength: -5,
                    modified_toughness: 5
                },
                type: "combat stance"
            };

            if (gameObjects.targetCharacter.props.effects) {
                gameObjects.targetCharacter.props.effects.push(testEffect)
            } else {
                gameObjects.targetCharacter.props.effects = [
                    testEffect
                ]
            }

            testBaseAction._reverseEffect(gameObjects.targetCharacter, testEffect.action_id);

            it("gameObjects.targetCharacter should no longer have an effect of " + testEffect.action_id, function(){
                assert.equal(_.findIndex(gameObjects.targetCharacter.props.effects, {'action_id': testEffect.action_id}), -1)
            })
        });
    });
});