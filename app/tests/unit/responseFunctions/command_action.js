"use strict";

const assert = require('assert');

const action = require('../../../controllers/gameContexts/command').action;
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

const gameContext = 'command';
const userSelection = 'action';

describe("Testing gameContext " + gameContext + " & user selection " +  userSelection, function() {

    describe("where the player typed the /action command in a channel that the player's character is not in", function(){

        let slackResponseTemplate = {};
        let slackCallback = '';

        let testCharacterID = '55e38d23d842e50e9026';

        //Arena channel ID
        //slackPayload.channel_id
        let requestChannelID = 'C4Z7F8XMW';

        let playerCharacter = new Character(game.state, testCharacterID);

        let requestZone = new Zone(game.state, requestChannelID);

        //Overwrite the player character's zone to ensure the character is in the town
        playerCharacter.props.zone_id = '-Khu9Zazk5XdFX9fD2Y8';

        let slackResponseTemplateReturned = action({
            game,
            slackResponseTemplate,
            requestZone,
            slackCallback,
            playerCharacter
        });

        testSlackResponseFormat(slackResponseTemplateReturned);

        it("should return .text property of _You can't perform an action in a zone that your character is not in_", function(){
            assert.equal(slackResponseTemplateReturned.text,"_You can't perform an action in a zone that your character is not in_")
        })
    });

    describe("where the player typed the /action command in a channel that the player's character is in", function(){

        let slackResponseTemplate = {};

        //Mock a character that does not have gender property set yet
        let testCharacterID = '55e38d23d842e50e9026';

        //Arena channel ID
        //slackPayload.channel_id
        let requestChannelID = 'C4Z7F8XMW';

        let playerCharacter = new Character(game.state, testCharacterID);

        let requestZone = new Zone(game.state, requestChannelID);

        let currentMatch = new Match(game.state, game.state.global_state.match_id);

        //Overwrite the player character's zone to ensure the character is in the arena
        playerCharacter.props.zone_id = '-Khu9Ti4cn9PQ2Q1TSBT';

        let slackResponseTemplateReturned = action({
            game,
            slackResponseTemplate,
            requestZone,
            currentMatch,
            playerCharacter
        });

        testSlackResponseFormat(slackResponseTemplateReturned);
    });
});



