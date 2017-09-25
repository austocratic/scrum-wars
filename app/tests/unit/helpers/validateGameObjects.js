"use strict";

const assert = require('assert');

const validateGameObjects = require('../../../helpers').validateGameObjects;
let Game = require('../../../models/Game').Game;
let Character = require('../../../models/Character').Character;
let User = require('../../../models/User').User;
let Zone = require('../../../models/Zone').Zone;
let Match = require('../../../models/Match').Match;
let Class = require('../../../models/Class').Class;
const Action = require('../../../models/Action').Action;

const testDB = require('../../testDB');

let game = new Game();
game.state = testDB;

describe("Testing helper function validateGameObjects", function(){

    let slackResponseTemplate = {};

    let testCharacterID = 'd130618f3a221f672cfc';

    let playerCharacter = new Character(game.state, testCharacterID);
    let characterClass = new Class(game.state, playerCharacter.props.class_id);

    const userActionValueSelection = 'equipment';

    //The Town channel ID
    let requestChannelID = 'C4Z4P1BUH';

    let requestZone = new Zone(game.state, requestChannelID);
    let currentMatch = new Match(game.state, game.getCurrentMatchID());

    let actionTakenID = '-Kjpe29q_fDkJG-73AQO';
    
    let slackRequestUserID = "U4ZA6CCBG";
    let user = new User(game.state, slackRequestUserID);
    
    let targetCharacter = playerCharacter;

    describe("with all expected gameObjects properties passed in", function(){
        
        describe("with all gameObjects of the correct data type", function(){

            let actionTaken = new Action(game.state, actionTakenID);
            let slackCallback = 'command:profile/selectProfileMenu';
            
            let gameObjectsToValidate = {
                game,
                user,
                slackResponseTemplate,
                playerCharacter,
                userActionValueSelection,
                //TODO to check on this:
                //slackRequestCommand, This is referenced as payload.command in getInteractiveMessageResponse slackRequest function, but I dont think it is actually passed in
                slackCallback,
                requestZone,
                currentMatch,
                characterClass,
                targetCharacter,
                actionTaken
            };

            let expectedGameObjects = [
                'game',
                'user',
                'slackResponseTemplate',
                'userActionValueSelection',
                //See note in gameObjectsToValidate array above
                //'slackRequestCommand',
                'slackCallback',
                'characterClass',
                'playerCharacter',
                'targetCharacter',
                'requestZone',
                'currentMatch',
                'actionTaken'
            ];
            
            
            it("should not throw an error", function(){
                assert.doesNotThrow(
                    () => {
                        validateGameObjects(gameObjectsToValidate, expectedGameObjects);
                    },
                    Error,
                    'validateGameObjects DID throw an unexpected error'
                );
            })
        });
        
        describe("with an expected string value passed in as an object", function(){

            let actionTaken = new Action(game.state, actionTakenID);
            let slackCallback = new User(game.state, slackRequestUserID);
            
            let gameObjectsToValidate = {
                game,
                user,
                slackResponseTemplate,
                playerCharacter,
                userActionValueSelection,
                //TODO to check on this:
                //slackRequestCommand, This is referenced as payload.command in getInteractiveMessageResponse slackRequest function, but I dont think it is actually passed in
                slackCallback,
                requestZone,
                currentMatch,
                characterClass,
                targetCharacter,
                actionTaken
            };

            let expectedGameObjects = [
                'game',
                'user',
                'slackResponseTemplate',
                'userActionValueSelection',
                //See note in gameObjectsToValidate array above
                //'slackRequestCommand',
                'slackCallback',
                'characterClass',
                'playerCharacter',
                'targetCharacter',
                'requestZone',
                'currentMatch',
                'actionTaken'
            ];
            
            it("should throw an error", function(){
                assert.throws(
                    () => {
                        validateGameObjects(gameObjectsToValidate, expectedGameObjects);
                    },
                    Error,
                    'validateGameObjects correctly threw an error'
                );
            })
        });

        describe("with an expected object value passed in as a string", function(){

            let actionTaken = 'I am a string';
            let slackCallback = 'command:profile/selectProfileMenu';

            let gameObjectsToValidate = {
                game,
                user,
                slackResponseTemplate,
                playerCharacter,
                userActionValueSelection,
                //TODO to check on this:
                //slackRequestCommand, This is referenced as payload.command in getInteractiveMessageResponse slackRequest function, but I dont think it is actually passed in
                slackCallback,
                requestZone,
                currentMatch,
                characterClass,
                targetCharacter,
                actionTaken
            };

            let expectedGameObjects = [
                'game',
                'user',
                'slackResponseTemplate',
                'userActionValueSelection',
                //See note in gameObjectsToValidate array above
                //'slackRequestCommand',
                'slackCallback',
                'characterClass',
                'playerCharacter',
                'targetCharacter',
                'requestZone',
                'currentMatch',
                'actionTaken'
            ];

            it("should throw an error", function(){
                assert.throws(
                    () => {
                        validateGameObjects(gameObjectsToValidate, expectedGameObjects);
                    },
                    Error,
                    'validateGameObjects correctly threw an error'
                );
            })
        })
    });
});
