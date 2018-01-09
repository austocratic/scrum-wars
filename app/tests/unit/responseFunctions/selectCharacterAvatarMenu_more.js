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

//Callback responded to before avatar selection menu
//command:action/generateCharacterConfirmation:yes:yes/selectCharacterClassMenu:classSelection:-KircgtGZhoRrHnKryS5/selectGenderMenu:genderSelection:male/selectCharacterAvatarMenu

//Callback response after tapping More on avatar selection
//command:action/generateCharacterConfirmation:yes:yes/selectCharacterClassMenu:classSelection:-KircgtGZhoRrHnKryS5/selectGenderMenu:genderSelection:male/selectCharacterAvatarMenu:more:6/selectCharacterAvatarMenu

//Callback resonse after tapping More than previous in avatar selection menu
//command:action/generateCharacterConfirmation:yes:yes/selectCharacterClassMenu:classSelection:-KircgtGZhoRrHnKryS5/selectGenderMenu:genderSelection:male/selectCharacterAvatarMenu:more:6/selectCharacterAvatarMenu:more:0/selectCharacterAvatarMenu

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

