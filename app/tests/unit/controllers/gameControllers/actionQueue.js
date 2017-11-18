"use strict";

const assert = require('assert');
const Character = require('../../../../../app/models/Character').Character;
const Game = require('../../../../../app/models/Game').Game;
const Action = require('../../../../../app/models/Action').Action;
const Match = require('../../../../../app/models/Match').Match;
const Zone = require('../../../../../app/models/Zone').Zone;
const testDB = require('../../../testDB');
const actionQueue = require('../../../../../app/controllers/gameControllers/actionQueue').actionQueue;

let game = new Game();
game.state = testDB;

describe("Testing actionQueue", function() {

    //Add a match for this test with an action queue
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
        "zone_id" : '-Khu9Ti4cn9PQ2Q1TSBT',
        "action_queue": [
            {
                action_id: "-KzFQs54K3qanmeGEEgF",
                turn_initiated: 1,
                player_character_id: "55e38d23d842e50e9026",
                target_character_id: "-Kkxf1ukVSF9VV6mIPlG",
                channel_id: "C4Z7F8XMW"
            }
        ]
    };

    let numberTurnsToTest = 5;

    describe(`passing the match into actionQueue(), testing for ${numberTurnsToTest} turns`, function(){

        let gameObjects = {
            slackResponseTemplate: {},
            currentMatch: new Match(game.state, 'testingMatch'),
            game,
            slackCallback: 'command:action/selectActionMenu:-Kjpe29q_fDkJG-73AQO/selectActionTarget',
        };

        for (let turnNumber = 1; turnNumber < numberTurnsToTest; turnNumber++) {
            describe(`on turn number ${turnNumber}`, function() {
                it(`calling the function should not be undefined`, function () {
                    gameObjects.currentMatch.props.number_turns = turnNumber;
                    assert(actionQueue(gameObjects))
                })
            })
        }

        /*
        describe("testing first action", function(){

            //console.log('DEBUG, # of array elements BEFORE processing: ', game.state.match['testingMatch'].effect_queue.length);

            game.state.match['testingMatch'].number_turns = 1;

            it("calling the function should not be undefined", function(){
                //assert(effectQueue(gameObjects));

                actionQueue(gameObjects);

                //console.log('DEBUG, # of array elements AFTER processing: ', game.state.match['testingMatch'].effect_queue.length);
            })


        });

        describe.skip("testing second effect", function(){

            game.state.match['testingMatch'].number_turns = 2;

            it("calling the function should not be undefined", function(){
                assert(actionQueue(gameObjects))
            })
        })*/
    });

});

