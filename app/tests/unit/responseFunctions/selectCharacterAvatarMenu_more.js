"use strict";

const assert = require('assert');

const more = require('../../../controllers/gameContextControllers/selectCharacterAvatarMenu').more;

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

const userActionValueSelection = '12';

const slackCallback = 'selectShopItemMenu:-KjGQEzVbaxRlWFawSqI/purchaseItemConfirmation:yes';

describe("Testing gameContext " + gameContext + " & user selection " +  userActionValueSelection, function() {

    let slackResponseTemplate = {};

    let testCharacterID = '55e38d23d842e50e9026';

    let playerCharacter = new Character(game.state, testCharacterID);

    let slackResponseTemplateReturned = more({
        game,
        userActionValueSelection,
        slackCallback,
        playerCharacter,
        slackResponseTemplate
    });

    testSlackResponseFormat(slackResponseTemplateReturned);
});

