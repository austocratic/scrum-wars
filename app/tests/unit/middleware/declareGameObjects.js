"use strict";

const assert = require('assert');
const declareGameObjects = require('../../../../app/middleware/declareGameObjects').declareGameObjects;
const updateGameObjectsForReservedActionName = require('../../../../app/middleware/declareGameObjects').updateGameObjectsForReservedActionName;


var testDB = require('../../testDB');
var Game = require('../../../models/Game').Game;


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

    function tryToParseJSON(input){
        try {
            return JSON.parse(input);
        } catch(err){
            return input
        }
    }

    if (tryToParseJSON(req.body.payload)){
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

describe("Testing updateGameObjectsForReservedActionName() Middleware", function(){

    let gameObjects = {
        userActionNameSelection: 'back',
        userActionValueSelection: '',
        command: '',
        slackCallback: 'command:profile/characterProfileMenu:inventory:inventory/selectInventoryMenu:inventorySelection:-KjGQ1IPuwE24t4LPPNd/itemDetailMenu',
    };

    updateGameObjectsForReservedActionName(gameObjects);

    it("should modify the callback", function(){
        assert.equal(gameObjects.slackCallback, 'command:profile/characterProfileMenu')
    });

    it("should modify the userActionNameSelection", function(){
        assert.equal(gameObjects.userActionNameSelection, 'inventory')
    });

    it("should modify the userActionValueSelection", function(){
        assert.equal(gameObjects.userActionValueSelection, 'inventory')
    });


});