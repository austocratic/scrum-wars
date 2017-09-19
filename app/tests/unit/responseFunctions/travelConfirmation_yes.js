"use strict";

const assert = require('assert');

const yes = require('../../../controllers/gameContexts/travelConfirmation').yes;

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

const gameContext = 'travelConfirmation';
const userActionValueSelection = 'yes';

describe("Testing gameContext " + gameContext + " & user selection " +  userActionValueSelection, function() {

    let slackResponseTemplate = {};

    let testCharacterID = 'd130618f3a221f672cfc';

    let playerCharacter = new Character(game.state, testCharacterID);

    //Arena channel ID
    //slackPayload.channel_id
    let requestChannelID = 'C4Z7F8XMW';

    let requestZone = new Zone(game.state, requestChannelID);

    let slackResponseTemplateReturned = yes({
        slackResponseTemplate,
        requestZone,
        playerCharacter
    });

    testSlackResponseFormat(slackResponseTemplateReturned);

});
