"use strict";

const assert = require('assert');

const testDB = require('../../../testDB');

let Game = require('../../../../models/Game').Game;
let Character = require('../../../../models/Character').Character;
let User = require('../../../../models/User').User;
let Zone = require('../../../../models/Zone').Zone;
let Match = require('../../../../models/Match').Match;
let Class = require('../../../../models/Class').Class;

let game = new Game();
game.state = testDB;

//const gameContext = 'genderSelection';
//const userSelection = 'female';

//Overwrite the game.state with global settings & match for testing

game.state.global_state = {
    "-Kjkkd-WF6OZAa9tCOt0" : {
        "number_turns" : 1
    },
    "match_id" : "testingMatch",
        "next_match_start" : 5000000000
};

game.state.match["testingMatch"] = {
    "character_id_won" : 0,
    "date_started" : 1443615911.108, // 9AM & 15 seconds PST
    "date_ended" : 0,
    "number_turns" : 3,
    "starting_character_ids" : [
        "-Kkxf1ukVSF9VV6mIPlG",
        "55e38d23d842e50e9026"
    ],
    "status": "started",
    "zone_id" : "-Khu9Ti4cn9PQ2Q1TSBT"
};

describe("Testing gameContext game.refresh()", function() {

    console.log('DEBUG calling refresh');
    game.refresh();
    
    //console.log('TESTING env: ', process.env.SLACK_HOOK)

});

