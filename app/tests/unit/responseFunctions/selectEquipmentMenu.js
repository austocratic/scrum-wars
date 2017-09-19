"use strict";

const assert = require('assert');

const equipmentSelection = require('../../../controllers/gameContexts/selectEquipmentMenu').equipmentSelection;

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
const userSelection = '-KjGQEzVbaxRlWFawSqI';

describe("Testing gameContext " + gameContext + " & user selection " +  userSelection, function() {

    let slackResponseTemplate = {};

    let slackResponseTemplateReturned = equipmentSelection({
        game,
        slackResponseTemplate,
        userSelection
    });

    testSlackResponseFormat(slackResponseTemplateReturned);
});

