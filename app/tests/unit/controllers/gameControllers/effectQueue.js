"use strict";

const assert = require('assert');
const Character = require('../../../../../app/models/Character').Character;
const Game = require('../../../../../app/models/Game').Game;
const Action = require('../../../../../app/models/Action').Action;
const Match = require('../../../../../app/models/Match').Match;
const Zone = require('../../../../../app/models/Zone').Zone;
const testDB = require('../../../testDB');
const effectQueue = require('../../../../../app/controllers/gameControllers/effectQueue').effectQueue;
const Firestorm2 = require('../../../../../app/controllers/actionControllers/actions/Firestorm2').Firestorm2;

let game = new Game();
game.state = testDB;

describe("Testing effectQueue", function() {

    //What should it do?

    //It should process the effect that has the right turn

    //It should remove the effect from the queue that has the right turn

    //It should not change effects that have a different turn than current turn


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
        "effect_queue": [
            {
                action_id: "-KyZ-_1kQ7_4UrHLt1vR", //Firestorm2 (will need to update if I removed this action)
                effect_function: "beginCastingMessage",
                activation_turn: 1,
                player_character_id: "55e38d23d842e50e9026",
                target_character_id: "", //AOE action does not have a target (wont be referenced)
                channel_id: "C4Z7F8XMW"
            },
            {
                action_id: "-KyZ-_1kQ7_4UrHLt1vR", //Firestorm2 (will need to update if I removed this action)
                effect_function: "",
                activation_turn: 2,
                player_character_id: "55e38d23d842e50e9026",
                target_character_id: "", //AOE action does not have a target (wont be referenced)
                channel_id: "C4Z7F8XMW"
            }
        ]
    };

    describe("passing the match into effectQueue()", function(){

        let gameObjects = {
            slackResponseTemplate: {},
            currentMatch: new Match(game.state, 'testingMatch'),
            game,
            slackCallback: 'command:action/selectActionMenu:-Kjpe29q_fDkJG-73AQO/selectActionTarget',
        };

        describe("testing first effect", function(){
            it("calling the function should not be undefined", function(){
                assert(effectQueue(gameObjects))
            })
        });

        describe("testing second effect", function(){

            game.state.match['testingMatch'].number_turns = 2;

            it("calling the function should not be undefined", function(){
                assert(effectQueue(gameObjects))
            })
        })
    });

});

