"use strict";

const assert = require('assert');

const action = require('../../../controllers/gameContextControllers/command').action;
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

describe("Testing /action command", function() {

    let gameObjects = {
        game: game,
        user: new User(game.state, 'U4ZA6CCBG'),
        slackResponseTemplate: {},
        playerCharacter: new Character(game.state, '55e38d23d842e50e9026'),
        requestZone: new Zone (game.state, 'C4Z7F8XMW'),
        currentMatch: new Match (game.state, '-KmTBxH0tkNaSo0rdT61'),
        characterClass: new Class (game.state, '-KircSgAkPTavnfob8F5')
    };

    //Make sure the test character is in the arena:
    gameObjects.playerCharacter.props.zone_id = '-Khu9Ti4cn9PQ2Q1TSBT';

    //Reset the characters actions to 8 of the same action
    gameObjects.playerCharacter.props.actions =
        [
            {
            "action_id" : "-Kjpe29q_fDkJG-73AQO",
            "is_available" : 1,
            "turn_available" : 0,
            "turn_used" : 1
        },
        {
            "action_id" : "-Kjpe29q_fDkJG-73AQO",
            "is_available" : 1,
            "turn_available" : 0,
            "turn_used" : 1
        },
        {
            "action_id" : "-Kjpe29q_fDkJG-73AQO",
            "is_available" : 1,
            "turn_available" : 0,
            "turn_used" : 1
        },
        {
            "action_id" : "-Kjpe29q_fDkJG-73AQO",
            "is_available" : 1,
            "turn_available" : 0,
            "turn_used" : 1
        },
        {
            "action_id" : "-Kjpe29q_fDkJG-73AQO",
            "is_available" : 1,
            "turn_available" : 0,
            "turn_used" : 1
        },
        {
            "action_id" : "-Kjpe29q_fDkJG-73AQO",
            "is_available" : 1,
            "turn_available" : 0,
            "turn_used" : 1
        },
        {
            "action_id" : "-Kjpe29q_fDkJG-73AQO",
            "is_available" : 1,
            "turn_available" : 0,
            "turn_used" : 1
        },
        {
            "action_id" : "-Kkdk_CD5vx8vRGQD268",
            "is_available" : 1,
            "turn_available" : 0,
            "turn_used" : 1
        }];

    const expectedResponse = {};

    const actualResponse = action(gameObjects);

    console.log('DEBUG: actualResponse.slackResponseTemplate: ', actualResponse.attachments[1].actions.length);

    it(`response should have an attachments array with 3 elements`, function() {
        assert.equal(actualResponse.attachments.length, 3)
    });

    it(`responses 1st attachment element should have an actions array with 5 elements`, function() {
        assert.equal(actualResponse.attachments[0].actions.length, 5)
    });

    it(`responses 2nd attachment element should have an actions array with 2 elements`, function() {
        assert.equal(actualResponse.attachments[1].actions.length, 2)
    });

    it(`responses 3rd attachment element should have an actions array with 1 element`, function() {
        assert.equal(actualResponse.attachments[2].actions.length, 1)
    });


    /*
    describe("when the player has already taken an action this turn", function(){

        let slackResponseTemplate = {};

        let currentMatch = new Match(game.state, game.state.global_state.match_id);

        //Mock a character that does not have gender property set yet
        let testCharacterID = '55e38d23d842e50e9026';

        let playerCharacter = new Character(game.state, testCharacterID);
        
        //console.log('DEBUG current turn: ', currentMatch.props.number_turns);
        
        //Push an action to the character that has already been used this turn
        playerCharacter.props.actions.push( {
            "action_id" : "-Kjpe29q_fDkJG-73AQO",
            "is_available" : 1,
            "turn_available" : 0,
            "turn_used" : currentMatch.props.number_turns
        });

        //console.log('DEBUG player actions: ',  playerCharacter.props.actions);

        //Arena channel ID
        //slackPayload.channel_id
        let requestChannelID = 'C4Z7F8XMW';

        let requestZone = new Zone(game.state, requestChannelID);

        //Overwrite the player character's zone to ensure the character is in the arena
        playerCharacter.props.zone_id = '-Khu9Ti4cn9PQ2Q1TSBT';

        let slackResponseTemplateReturned = action({
            game,
            slackResponseTemplate,
            requestZone,
            currentMatch,
            playerCharacter
        });

        //console.log('slackResponseTemplateReturned: ', slackResponseTemplateReturned);

        const takenMessage = "You have already taken an action this turn, wait until next turn";

        it(`should return an object with text stating ${takenMessage}`, function() {
            assert.equal(slackResponseTemplateReturned.text, takenMessage)
        });

        //testSlackResponseFormat(slackResponseTemplateReturned);

    })*/
});



