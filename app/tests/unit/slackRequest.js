'use strict';

var request = require('request');
var assert = require('assert');

var testDB = require('../testDB');
var slackRequest = require('../../controllers/slackRequest');
var Game = require('../../models/Game').Game;
var Character = require('../../models/Character').Character;

var testGame = new Game();
testGame.state = testDB;

var testCharacterID = 'a7ad15dd1052e7e7ef8a';

var testCharacter = new Character(testGame.state, testCharacterID);


describe("slackRequest.getResponseTemplate()", function() {
    
    var requestCallback 
    var requestActionName 
    var requestActionValue
    var requestSlackUserID
    var requestSlackChannelID
    var gameContext
    var requestTextInput
    
    it(".initiate() should return 5", function(done) {


        var slackResponse = slackRequest.getResponseTemplate(requestCallback, requestActionName, requestActionValue, requestSlackUserID, requestSlackChannelID, gameContext, requestTextInput);

        console.log('unit test slackResponse: ', slackResponse);
        
        //var gameResult = testGame.inititate(5);

        //console.log('gameResult: ', gameResult);

        //assert.equal(gameResult, 5);

        done();

    });
});