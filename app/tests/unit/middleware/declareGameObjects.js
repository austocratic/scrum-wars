"use strict";

const assert = require('assert');
const declareGameObjects = require('../../../../app/middleware/declareGameObjects').declareGameObjects

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

    req.body.payload = {
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
        req.body.payload = tryToParseJSON(req.body.payload)
    } else {
        req.body.payload = tryToParseJSON(req.body)
    }

    declareGameObjects(req);
    
    it("should set the req.gameObjects property to contain several standard objects.", function () {
        assert(req.gameObjects.user);
        assert(req.gameObjects.permission);
        assert(req.gameObjects.requestZone);
        assert(req.gameObjects.currentMatch);
        assert(req.gameObjects.playerCharacter);
        assert(req.gameObjects.characterClass);
    });
});