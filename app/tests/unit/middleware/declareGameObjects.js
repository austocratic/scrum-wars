"use strict";

const assert = require('assert');
const declareGameObjects = require('../../../../app/middleware/declareGameObjects').declareGameObjects;

const testDB = require('../../testDB');
const Game = require('../../../models/Game').Game;


let game = new Game();
game.state = testDB;

let req;

req = {
    body: {
   
    },
    gameObjects: {
        game: game
    }
};

describe("Testing declareGameObject() Middleware", function() {

    describe("with a mock /generate command", function() {

        let testRequest = {
            "command": "/generate",
            "user_id": "U4ZA6CCBG",
            "user_name": "austo",
            "channel_id": "C4Z7F8XMW",
            "channel_name": "The Arena",
            "token": "a6qLRgANE3lHNDP50zb0vmoJ",
            "team_id": "T4ZAGTM1V",
            "team_domain": "austo",
            "text": "",
            "response_url": "https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT4ZAGTM1V%2F239499725731%2Fb0wOCK18eeETsD0mvH0LqYEB&trigger_id=239057170097.169356939063.08e9efc327159fc04d0a0845821c2a3a"
        };

        function tryToParseJSON(input) {
            try {
                return JSON.parse(input);
            } catch (err) {
                return input
            }
        }

        if (tryToParseJSON(req.body.payload)) {
            testRequest = tryToParseJSON(testRequest)
        } else {
            testRequest = tryToParseJSON(testRequest)
        }

        let gameObjects = declareGameObjects(game, testRequest);

        it("should set the gameObject object to contain a user", function () {
            assert(gameObjects.user);
        });
        it("should set the gameObject object to contain a permission", function () {
            assert(gameObjects.permission);
        });
        it("should set the gameObject object to contain a requestZone", function () {
            assert(gameObjects.requestZone);
        });
        it("should set the gameObject object to contain a currentMatch", function () {
            assert(gameObjects.currentMatch);
        });
        it("should set the gameObject object to contain a playerCharacter", function () {
            assert(gameObjects.playerCharacter);
        });
        it("should set the gameObject object to contain a characterClass", function () {
            assert(gameObjects.characterClass);
        });
    });

    describe("with a mock interactive message", function() {

        let testRequest = {"type":"interactive_message","actions":[{
            "name":"back","type":"button","value":"no"}],
            "callback_id":"command:profile/characterProfileMenu:inventory:inventory/selectInventoryMenu:inventorySelection:-KjGQEzVbaxRlWFawSqI/itemDetailMenu",
            "team":{"id":"T4ZAGTM1V","domain":"austo"},"channel":{"id":"C4Z4P1BUH","name":"town-square"},"user":{"id":"U4ZA6CCBG","name":"austo"},"action_ts":"1513914078.216236","message_ts":"1513914069.000007","attachment_id":"3","token":"a6qLRgANE3lHNDP50zb0vmoJ","is_app_unfurl":false,"response_url":"https://hooks.slack.com/actions/T4ZAGTM1V/289848121825/uCLHWyzdoH53PxWtHbjpPdoq","trigger_id":"289848121841.169356939063.6dd9e7d37b892a362814f9f4017ac3e0"};

        function tryToParseJSON(input) {
            try {
                return JSON.parse(input);
            } catch (err) {
                return input
            }
        }

        if (tryToParseJSON(req.body.payload)) {
            testRequest = tryToParseJSON(testRequest)
        } else {
            testRequest = tryToParseJSON(testRequest)
        }

        let gameObjects = declareGameObjects(game, testRequest);

        it("should set the gameObject object to contain a user", function () {
            assert(gameObjects.user);
        });
        it("should set the gameObject object to contain a permission", function () {
            assert(gameObjects.permission);
        });
        it("should set the gameObject object to contain a requestZone", function () {
            assert(gameObjects.requestZone);
        });
        it("should set the gameObject object to contain a currentMatch", function () {
            assert(gameObjects.currentMatch);
        });
        it("should set the gameObject object to contain a playerCharacter", function () {
            assert(gameObjects.playerCharacter);
        });
        it("should set the gameObject object to contain a characterClass", function () {
            assert(gameObjects.characterClass);
        });
        it("should set the gameObject object to contain a characterClass", function () {
            assert.equal(gameObjects.gameContext, 'itemDetailMenu');
        });
    });

    describe("with a mock interactive message with short callback", function() {

        let testRequest = {"type":"interactive_message","actions":[{
            "name":"back","type":"button","value":"no"}],
            "callback_id":"command:profile/characterProfileMenu",
            "team":{"id":"T4ZAGTM1V","domain":"austo"},"channel":{"id":"C4Z4P1BUH","name":"town-square"},"user":{"id":"U4ZA6CCBG","name":"austo"},"action_ts":"1513914078.216236","message_ts":"1513914069.000007","attachment_id":"3","token":"a6qLRgANE3lHNDP50zb0vmoJ","is_app_unfurl":false,"response_url":"https://hooks.slack.com/actions/T4ZAGTM1V/289848121825/uCLHWyzdoH53PxWtHbjpPdoq","trigger_id":"289848121841.169356939063.6dd9e7d37b892a362814f9f4017ac3e0"};

        function tryToParseJSON(input) {
            try {
                return JSON.parse(input);
            } catch (err) {
                return input
            }
        }

        if (tryToParseJSON(req.body.payload)) {
            testRequest = tryToParseJSON(testRequest)
        } else {
            testRequest = tryToParseJSON(testRequest)
        }

        let gameObjects = declareGameObjects(game, testRequest);

        it("should set the gameObject object to contain a user", function () {
            assert(gameObjects.user);
        });
        it("should set the gameObject object to contain a permission", function () {
            assert(gameObjects.permission);
        });
        it("should set the gameObject object to contain a requestZone", function () {
            assert(gameObjects.requestZone);
        });
        it("should set the gameObject object to contain a currentMatch", function () {
            assert(gameObjects.currentMatch);
        });
        it("should set the gameObject object to contain a playerCharacter", function () {
            assert(gameObjects.playerCharacter);
        });
        it("should set the gameObject object to contain a characterClass", function () {
            assert(gameObjects.characterClass);
        });
        it("should set the gameObject object to contain a characterClass", function () {
            assert.equal(gameObjects.gameContext, 'characterProfileMenu');
        });
    });
});
