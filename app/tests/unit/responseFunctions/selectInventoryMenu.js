"use strict";

const assert = require('assert');

const inventorySelection = require('../../../controllers/gameContexts/selectInventoryMenu').inventorySelection;

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

const gameContext = 'selectEquipmentMenu';

//Random item id
const userActionValueSelection = '-KjGQEzVbaxRlWFawSqI';

describe("Testing gameContext " + gameContext + " & user selection " +  userActionValueSelection, function() {

    let slackResponseTemplate = {};

    let slackResponseTemplateReturned = inventorySelection({
        game,
        slackResponseTemplate,
        userActionValueSelection
    });

    testSlackResponseFormat(slackResponseTemplateReturned);
});

