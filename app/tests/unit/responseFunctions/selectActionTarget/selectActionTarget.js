"use strict";


const assert = require('assert');

const processActionOnTarget = require('../../../../controllers/gameContexts/selectActionTarget').processActionOnTarget;

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

const gameContext = 'selectCharacterAvatarMenu';

const userActionValueSelection = '55e38d23d842e50e9026';

describe("Testing selectActionTarget function", function() {
    
    let slackResponseTemplate = {};

    let playerCharacter = new Character(game.state, '55e38d23d842e50e9026');

    let requestChannelID = 'C4Z7F8XMW';

    let requestZone = new Zone(game.state, requestChannelID);

    let matchID = '-KmTOFWVJav3v7j1hYLA';

    let currentMatch = new Match(game.state, matchID);
    
    describe("when callback includes action selected of -Kjpe29q_fDkJG-73AQO (Quick Strike)", function() {

        const slackCallback = 'command:action/selectActionMenu:-Kjpe29q_fDkJG-73AQO/selectActionTarget';
        
        let slackResponseTemplateReturned = processActionOnTarget({
            game,
            playerCharacter,
            userActionValueSelection,
            requestZone,
            currentMatch,
            slackCallback
        });
    });

    describe("when callback includes action selected of -KrJaBvyYDGrNVfcaAd0 (Arcane Bolt)", function() {

        const slackCallback = 'command:action/selectActionMenu:-KrJaBvyYDGrNVfcaAd0/selectActionTarget';

        let slackResponseTemplateReturned = processActionOnTarget({
            game,
            playerCharacter,
            userActionValueSelection,
            requestZone,
            currentMatch,
            slackCallback
        });
    });

    describe("when callback includes action selected of -Kr3hnITyH9ZKx3VuZah (Backstab)", function() {

        const slackCallback = 'command:action/selectActionMenu:-Kr3hnITyH9ZKx3VuZah/selectActionTarget';

        let slackResponseTemplateReturned = processActionOnTarget({
            game,
            playerCharacter,
            userActionValueSelection,
            requestZone,
            currentMatch,
            slackCallback
        });
    });
    
    
    //testSlackResponseFormat(slackResponseTemplateReturned);
});

