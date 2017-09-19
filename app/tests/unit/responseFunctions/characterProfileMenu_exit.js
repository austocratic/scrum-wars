"use strict";

const assert = require('assert');

const exit = require('../../../controllers/gameContexts/characterProfileMenu').exit;

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
const userSelection = 'exit';

describe("Testing gameContext " + gameContext + " & user selection " +  userSelection, function() {

    let slackResponseTemplate = {};

    let slackResponseTemplateReturned = exit({
        slackResponseTemplate
    });

    testSlackResponseFormat(slackResponseTemplateReturned);

});

