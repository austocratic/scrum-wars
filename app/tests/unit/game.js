'use strict';

var request = require('request');
var assert = require('assert');

var testDB = require('../testDB');
var Game = require('../../models/Game').Game;


var testGame = new Game();

testGame.state = testDB;

describe("Game model", function() {

    it(".initiate() should return 5", function(done) {
        
        var gameResult = testGame.inititate(5);
        
        console.log('gameResult: ', gameResult);

        assert.equal(gameResult, 5);
        
        done();
        
    });
});