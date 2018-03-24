"use strict";

const assert = require('assert');
const _ = require('lodash');
const moment = require('moment');

const testDB = require('../../testDB');

const Game = require('../../../models/Game').Game;
const Match = require('../../../models/Match').Match;

let game = new Game();
game.state = testDB;

describe("Testing Match model", function() {
    describe("instantiating new Match", function(){

        //Local time
        let currentDate = new moment();

        //Convert to local
        let currentDateLocal = currentDate.subtract(8, 'hours');

        let currentHour = currentDateLocal.hour();
        let currentDay = currentDate.day();

        //let testMatch = new Match(game.state, '-KmTBxH0tkNaSo0rdT61');
        let testMatchID = game.createMatch('-Khu9Ti4cn9PQ2Q1TSBT');

        let testMatch = new Match(game.state, testMatchID);

        testMatch.props.type = game.state.match.settings.type[_.get(game, `state.match.settings.schedule[${currentDay}].type_id`)];

        it("should not be undefined", function(){
            assert(testMatch)
        });

        describe("setting up the test match for free for all format", function(){
            //Setup the test match for free for all format
            testMatch.props.type = {
                name: 'Free-for-all'
            };

            describe("calling method start", function(){

                testMatch.start(['char1', 'char2', 'char3']);

                it("should have a date_started property", function(){
                    assert(testMatch.props.date_started)
                });
            });
        });
    });
});
