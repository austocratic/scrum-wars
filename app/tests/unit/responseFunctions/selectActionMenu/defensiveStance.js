"use strict";

const assert = require('assert');

const defensiveStance = require('../../../../controllers/gameContexts/selectActionMenu').defensiveStance;

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
//Defensive stance action ID
const userActionValueSelection = '-KjpeJT7Oct3ZCtLhENO';

let slackCallback = 'command:action/selectActionMenu';

describe("Testing gameContext " + gameContext + " & user selection " +  userActionValueSelection, function() {

    //The Arena channel ID
    let requestChannelID = 'C4Z7F8XMW';
    let requestZone = new Zone(game.state, requestChannelID);

    let playerCharacter = new Character(game.state, 'd130618f3a221f672cfc');
    
    let currentMatch = new Match(game.state, game.getCurrentMatchID());

    let slackResponseTemplateReturned = defensiveStance({
        game,
        playerCharacter,
        requestZone,
        currentMatch,
        userActionValueSelection
    });

    //testSlackResponseFormat(slackResponseTemplateReturned);
    
});

