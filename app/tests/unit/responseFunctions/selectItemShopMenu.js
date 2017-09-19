"use strict";

const assert = require('assert');

const selectItem = require('../../../controllers/gameContexts/selectItemShopMenu').selectItem;

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

const gameContext = 'selectItemShopMenu';

//Random item id
const userSelection = '-KjGQEzVbaxRlWFawSqI';

describe("Testing gameContext " + gameContext + " & user selection " +  userSelection, function() {

    let slackResponseTemplate = {};

    let slackResponseTemplateReturned = selectItem({
        game,
        slackResponseTemplate,
        userSelection
    });

    testSlackResponseFormat(slackResponseTemplateReturned);
});

