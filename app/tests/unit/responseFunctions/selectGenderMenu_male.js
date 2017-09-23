"use strict";

const assert = require('assert');

const genderSelection = require('../../../controllers/gameContexts/selectGenderMenu').genderSelection;

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

const gameContext = 'genderSelection';
const userActionValueSelection = 'male';

const slackCallback = 'generateCharacterConfirmation:yes/selectCharacterClassMenu:-KircSgAkPTavnfob8F5/selectGenderMenu';

describe("Testing gameContext " + gameContext + " & user selection " +  userActionValueSelection, function() {

    let slackResponseTemplate = {};

    //Mock a character that does not have gender property set yet
    let testCharacterID = 'charNoGender';

    let playerCharacter = new Character(game.state, testCharacterID);

    let slackResponseTemplateReturned = genderSelection({
        game,
        slackResponseTemplate,
        slackCallback,
        userActionValueSelection,
        playerCharacter
    });

    testSlackResponseFormat(slackResponseTemplateReturned);

});

