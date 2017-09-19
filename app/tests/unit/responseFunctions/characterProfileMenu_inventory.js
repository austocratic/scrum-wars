"use strict";

const assert = require('assert');

const inventory = require('../../../controllers/gameContexts/characterProfileMenu').inventory;

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
const userSelection = 'inventory';

describe("Testing gameContext " + gameContext + " & user selection " +  userSelection, function() {
    
    let slackResponseTemplate = {};

    let testCharacterID = 'd130618f3a221f672cfc';

    let playerCharacter = new Character(game.state, testCharacterID);

    let slackResponseTemplateReturned = inventory({
        game,
        slackResponseTemplate,
        playerCharacter
    });
    
    testSlackResponseFormat(slackResponseTemplateReturned);

});

