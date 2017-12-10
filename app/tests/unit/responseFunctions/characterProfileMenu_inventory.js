"use strict";

const assert = require('assert');

const inventory = require('../../../controllers/gameContextControllers/characterProfileMenu').inventory;

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

const gameContext = 'characterProfileMenu';
const userActionValueSelection = 'inventory';

const slackCallback = 'command:profile/selectProfileMenu';

describe("Testing gameContext " + gameContext + " & user selection " +  userActionValueSelection, function() {
    
    let slackResponseTemplate = {};

    let testCharacterID = '55e38d23d842e50e9026';

    let playerCharacter = new Character(game.state, testCharacterID);

    let slackResponseTemplateReturned = inventory({
        game,
        slackCallback,
        slackResponseTemplate,
        playerCharacter
    });
    
    testSlackResponseFormat(slackResponseTemplateReturned);

});

