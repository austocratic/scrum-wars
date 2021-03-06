"use strict";

const assert = require('assert');

const selection = require('../../../controllers/gameContextControllers/selectCharacterAvatarMenu').selection;

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

const userActionNameSelection = 'selection';
const userActionValueSelection = 'public/images/fullSize/character_avatar/female/f_16.png';

//const slackCallback = 'selectShopItemMenu:-KjGQEzVbaxRlWFawSqI/purchaseItemConfirmation:yes';

describe("Testing gameContext " + gameContext + " & user selection " +  userActionNameSelection, function() {

    let slackResponseTemplate = {};

    let testCharacterID = '55e38d23d842e50e9026';

    let playerCharacter = new Character(game.state, testCharacterID);

    let slackResponseTemplateReturned = selection({
        userActionValueSelection,
        playerCharacter,
        slackResponseTemplate
    });

    testSlackResponseFormat(slackResponseTemplateReturned);
});

