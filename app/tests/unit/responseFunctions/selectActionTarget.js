"use strict";

const assert = require('assert');

const processActionOnTarget = require('../../../controllers/gameContexts/selectActionTarget').processActionOnTarget;

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

const gameContext = 'selectCharacterAvatarMenu';

const userActionValueSelection = '-Kkxf1ukVSF9VV6mIPlG';

const slackCallback = 'command:action/selectActionMenu:quickStrike/selectActionTarget';

describe("Testing selectActionTarget function", function() {
    
    let slackResponseTemplate = {};

    let playerCharacter = new Character(game.state, 'd130618f3a221f672cfc');

    let requestChannelID = 'C4Z7F8XMW';

    let requestZone = new Zone(game.state, requestChannelID);
    
    let matchID = '-KmTOFWVJav3v7j1hYLA';
    
    let currentMatch = new Match(game.state, matchID);
    
    let slackResponseTemplateReturned = processActionOnTarget({
        game,
        playerCharacter,
        userActionValueSelection,
        requestZone,
        currentMatch,
        slackCallback
    });
    
    //testSlackResponseFormat(slackResponseTemplateReturned);
});
