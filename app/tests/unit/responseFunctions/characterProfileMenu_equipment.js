"use strict";

const assert = require('assert');

const equipment = require('../../../controllers/gameContexts/characterProfileMenu').equipment;

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
const userActionValueSelection = 'equipment';

const slackCallback = 'command:profile/selectProfileMenu';

describe("Testing gameContext " + gameContext + " & user selection " +  userActionValueSelection, function() {

    let slackResponseTemplate = {};

    let testCharacterID = 'd130618f3a221f672cfc';

    let playerCharacter = new Character(game.state, testCharacterID);

    let slackResponseTemplateReturned = equipment({
        game,
        slackCallback,
        slackResponseTemplate,
        playerCharacter
    });

    testSlackResponseFormat(slackResponseTemplateReturned);

});

