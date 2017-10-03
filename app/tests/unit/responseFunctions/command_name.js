"use strict";

const assert = require('assert');

const name = require('../../../controllers/gameContexts/command').name;

const testSlackResponseFormat = require('../../testSlackResponseFormat').testSlackResponseFormat;

const testDB = require('../../testDB');

let Game = require('../../../models/Game').Game;
let Character = require('../../../models/Character').Character;
let User = require('../../../models/User').User;
let Zone = require('../../../models/Zone').Zone;
let Match = require('../../../models/Match').Match;
let Class = require('../../../models/Class').Class;

let game = new Game();
game.state = testDB;

const gameContext = 'command';
const userSelection = 'name';

describe("Testing gameContext " + gameContext + " & user selection " +  userSelection, function() {

    describe("when there is not a character with the inputted name", function(){

        let slackResponseTemplate = {};

        let testCharacterID = '55e38d23d842e50e9026';

        let playerCharacter = new Character(game.state, testCharacterID);

        let slackRequestText = 'Test Name';

        let slackResponseTemplateReturned = name({
            game,
            slackResponseTemplate,
            playerCharacter,
            slackRequestText
        });

        testSlackResponseFormat(slackResponseTemplateReturned);

    });

});

