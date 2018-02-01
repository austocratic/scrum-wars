"use strict";

const Game = require('../../../../../app/models/Game').Game;
const Match = require('../../../../../app/models/Match').Match;
const testDB = require('../../../testDB');

const refresh = require('../../../../../app/controllers/gameControllers/refresh').refresh;


let game = new Game();
game.state = testDB;

describe("Testing refresh.js", function() {

    describe("with a match in the pending state", function() {

        let gameObjects = {
            slackResponseTemplate: {},
            currentMatch: new Match(game.state, 'testingMatch'),
            game,
            slackCallback: 'command:action/selectActionMenu:-Kjpe29q_fDkJG-73AQO/selectActionTarget',
        };

        gameObjects.currentMatch.props.status = 'pending';

        //This will always trigger the start the match criteria
        gameObjects.game.matchStartTime = 0;

        refresh(gameObjects);

    });



});