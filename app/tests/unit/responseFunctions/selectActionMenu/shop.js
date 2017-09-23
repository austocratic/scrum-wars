"use strict";

const assert = require('assert');

const shop = require('../../../../controllers/gameContexts/selectActionMenu').shop;

const testSlackResponseFormat = require('../../../testSlackResponseFormat').testSlackResponseFormat;

const testDB = require('../../../testDB');

let Game = require('../../../../models/Game').Game;
let Character = require('../../../../models/Character').Character;
let User = require('../../../../models/User').User;
let Zone = require('../../../../models/Zone').Zone;
let Match = require('../../../../models/Match').Match;
let Class = require('../../../../models/Class').Class;

let game = new Game();
game.state = testDB;

const gameContext = 'selectActionMenu';
const userActionValueSelection = 'Shop';

let slackCallback = 'command:action/selectActionMenu:';

describe("Testing gameContext " + gameContext + " & user selection " +  userActionValueSelection, function() {
    
    let slackResponseTemplate = {};

    //The Town channel ID
    let requestChannelID = 'C4Z4P1BUH';

    let requestZone = new Zone(game.state, requestChannelID);

    let slackResponseTemplateReturned = shop({
        game,
        slackResponseTemplate,
        slackCallback,
        requestZone
    });
    
    console.log('DEBUG shop slackResponseTemplateReturned: ', JSON.stringify(slackResponseTemplateReturned));

    testSlackResponseFormat(slackResponseTemplateReturned);

});

