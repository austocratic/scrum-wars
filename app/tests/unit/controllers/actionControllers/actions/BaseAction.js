"use strict";

const assert = require('assert');
const _ = require('lodash');
const BaseAction = require('../../../../../../app/controllers/actionControllers/actions/BaseAction').BaseAction;
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

        describe("testing BaseAction method _getUniqueRandomTarget", function () {

            describe("with argument 1", function () {
                let targetArray = testBaseAction._getUniqueRandomTarget(1);

                it("should return an array of length", function (){
                    assert.equal(targetArray.length, 1);
                });
            });
            describe("with argument 2", function () {
                let targetArray = testBaseAction._getUniqueRandomTarget(2);

                it("should return an array of length", function (){
                    assert.equal(targetArray.length, 2);
                });
            });
            describe("with argument 3", function () {
                let targetArray = testBaseAction._getUniqueRandomTarget(3);

                it("should return an array of length", function (){
                    assert.equal(targetArray.length, 2);
                });
            });

        });

        describe("testing BaseAction method _processDamage", function () {

            //Set up an action Queue
            testBaseAction.currentMatch.props.action_queue = [
                {
                    "action_id": '-Kjpe29q_fDkJG-73AQO', //Quickstrike
                    "turn_initiated": testBaseAction.currentMatch.props.number_turns,
                    "channel_id": testBaseAction.currentZone.props.channel_id,
                    "player_character_id": testBaseAction.targetCharacter.id,
                    "target_character_id": testBaseAction.actionCharacter.id,
                    "last_turn_processed": testBaseAction.currentMatch.props.number_turns
                },
                {
                    "action_id": '-Ky1zv4JXgbAKvxFFBmp', //Cleave
                    "turn_initiated": testBaseAction.currentMatch.props.number_turns + 1,
                    "channel_id": testBaseAction.currentZone.props.channel_id,
                    "player_character_id": testBaseAction.targetCharacter.id,
                    "target_character_id": testBaseAction.actionCharacter.id,
                    "last_turn_processed": testBaseAction.currentMatch.props.number_turns
                },
                {
                    "action_id": '-Ky3C664qBFIYS4R4ItQ', //Firestorm
                    "turn_initiated": testBaseAction.currentMatch.props.number_turns,
                    "channel_id": testBaseAction.currentZone.props.channel_id,
                    "player_character_id": '55e38d23d842e50e9026', //Sindria
                    "target_character_id": '-Kkxf1ukVSF9VV6mIPlG', //Freddy,
                    "last_turn_processed": testBaseAction.currentMatch.props.number_turns
                },
                {
                    "action_id": '-Ky3C664qBFIYS4R4ItQ', //Firestorm
                    "turn_initiated": testBaseAction.currentMatch.props.number_turns,
                    "channel_id": testBaseAction.currentZone.props.channel_id,
                    "player_character_id": '-Kkxf1ukVSF9VV6mIPlG', //Freddy
                    "target_character_id": '55e38d23d842e50e9026', //Sindria,
                    "last_turn_processed": testBaseAction.currentMatch.props.number_turns
                }
            ];

            //console.log('DEBUG actionQueue BEFORE: ', testBaseAction.currentMatch.props.action_queue.length);

            testBaseAction._processDamage();

            //console.log('DEBUG actionQueue AFTER: ', testBaseAction.currentMatch.props.action_queue);

            //console.log('DEBUG BaseAction test targetArray: ', targetArray);

            it("action_queue should not contain any actions initiated by this action's target", function(){
                assert.equal(_.find(testBaseAction.currentMatch.props.action_queue, {player_character_id: testBaseAction.targetCharacter.id}), undefined)
            });

            it("action_queue should still contain at least 1 action initiated by this action's player", function(){
                assert(_.find(testBaseAction.currentMatch.props.action_queue, {player_character_id: testBaseAction.actionCharacter.id}))
            })
        });

        /* Depricating the _incrementProperties method in BaseAction, property increment will be done by models (function in the base model)
        describe("testing BaseAction method _incrementProperties", function () {

            //Modifiers to apply on action success
            let statsToModify = {
                toughness: 8,
                strength: -8
            };

            let toughnessBefore = gameObjects.targetCharacter.props.stats_current.toughness;
            let strengthBefore = gameObjects.targetCharacter.props.stats_current.strength;

            console.log('toughness before modify: ', toughnessBefore);

            testBaseAction._incrementProperties(gameObjects.targetCharacter, statsToModify);

            it("updated modified_toughness should be " + statsToModify.toughness + " greater than previous toughness", function (){
                assert.equal(gameObjects.targetCharacter.props.stats_current.toughness, toughnessBefore + statsToModify.toughness);
            });

            it("updated modified_strength should be " + statsToModify.strength + " less than previous strength", function (){
                assert.equal(gameObjects.targetCharacter.props.stats_current.strength, strengthBefore + statsToModify.modified_strength);
            })
        });*/

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

        describe("testing BaseAction method _applyDamage", function () {

            console.log('calculatedPower: ', testBaseAction.calculatedPower);

            console.log('calculatedMitigation: ', testBaseAction.calculatedMitigation);

            //testBaseAction._applyDamage();

            /*
            it("gameObjects.targetCharacter should no longer have an effect of " + testEffect.action_id, function(){
                assert.equal(_.findIndex(gameObjects.targetCharacter.props.effects, {'action_id': testEffect.action_id}), -1)
            })*/
        });
    });
});