"use strict";

const assert = require('assert');

const quickStrike = require('../../../../controllers/gameContexts/selectActionMenu').quickStrike;

const testSlackResponseFormat = require('../../../testSlackResponseFormat').testSlackResponseFormat;

const testDB = require('../../../testDB');

let Game = require('../../../../models/Game').Game;
let Character = require('../../../../models/Character').Character;
let User = require('../../../../models/User').User;
let Zone = require('../../../../models/Zone').Zone;
let Match = require('../../../../models/Match').Match;
let Class = require('../../../../models/Class').Class;

let game = new Game();
game.state = testDB;

const gameContext = 'selectActionMenu';
const userActionValueSelection = 'quickStrike';

let slackCallback = 'command:action/quickStrike:';

describe("Testing gameContext " + gameContext + " & user selection " +  userActionValueSelection, function() {
    
    let slackResponseTemplate = {};

    //The Town channel ID
    let requestChannelID = 'C4Z4P1BUH';

    let requestZone = new Zone(game.state, requestChannelID);

    let playerCharacter = new Character(game.state, 'd130618f3a221f672cfc');

    let slackResponseTemplateReturned = quickStrike({
        game,
        playerCharacter,
        userActionValueSelection,
        slackResponseTemplate,
        slackCallback,
        requestZone
    });

    testSlackResponseFormat(slackResponseTemplateReturned);

});

