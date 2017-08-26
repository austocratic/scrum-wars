'use strict';

var request = require('request');
var assert = require('assert');

var testDB = require('../testDB');
var Game = require('../../models/Game').Game;
var Character = require('../../models/Character').Character;

var testGame = new Game();
testGame.state = testDB;

var testCharacterID = 'a7ad15dd1052e7e7ef8a';

var testCharacter = new Character(testGame.state, testCharacterID);
/*
describe("Game model", () => {

    it(".initiate() should return 5", done => {
        
        var gameResult = testGame.inititate(5);
        
        console.log('gameResult: ', gameResult);

        assert.equal(gameResult, 5);
        
        done();
        
    });
});

describe("game.getEquippedItemView()", () => {

    it("should return an array", done => {

        var results = testGame.getEquippedItemView(testCharacter);

        console.log('getEquippedItemView results: ', results);

        //assert.equal(gameResult, 5);

        done();

    });
});*/

describe("game.initiate()", () => {

    it("should return an array", done => {

        console.log('modified_strength before initiate(): ', testGame.state.character[testCharacterID].modified_strength);

        testGame.inititate();

        console.log('modified_strength after initiate(): ', testGame.state.character[testCharacterID].modified_strength);

        //assert.equal(gameResult, 5);

        done();

    });
});