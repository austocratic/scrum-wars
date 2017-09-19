"use strict";

const assert = require('assert');

const no = require('../../../controllers/gameContexts/generateCharacterConfirmation').no;

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

const gameContext = 'generateCharacterConfirmation';
const userActionValueSelection = 'yes';

describe("Testing gameContext " + gameContext + " & user selection " +  userActionValueSelection, function() {

    let slackResponseTemplate = {};

    let slackResponseTemplateReturned = no({
        slackResponseTemplate
    });

    testSlackResponseFormat(slackResponseTemplateReturned);
});

