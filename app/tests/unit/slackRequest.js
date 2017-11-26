'use strict';

var request = require('request');
var assert = require('assert');

const testSlackResponseFormat = require('../testSlackResponseFormat').testSlackResponseFormat;

var testDB = require('../testDB');
var slackRequest = require('../../controllers/slackRequest');
var Game = require('../../models/Game').Game;
var Character = require('../../models/Character').Character;
var User = require('../../models/User').User;
var Zone = require('../../models/Zone').Zone;
var Match = require('../../models/Match').Match;
var Class = require('../../models/Class').Class;

let game = new Game();
game.state = testDB;

let testSlackRequest = {
    user: {
        id: 'U4ZA6CCBG'
    },
    callback_id: ''
};


//let playerCharacter = new Character(game.state, testCharacterID);
let user = new User(game.state, testSlackRequest.user.id);
let slackCallback = testSlackRequest.callback_id;

/*
describe("Testing slackRequest.getSlashCommandResponse()", function(){

    let mockRequest = {
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

    let slackResponseTemplateReturned = slackRequest.getSlashCommandResponse(mockRequest, game);

    testSlackResponseFormat(slackResponseTemplateReturned);

    console.log('slackResponseTemplateReturned: ', slackResponseTemplateReturned)

});*/

/* THIS TEST IS NOT WORKING.  processSlashCommand() queries the real DB, so I have no way to mock the DB
describe("Testing slackRequest.processSlashCommand() with a mock slash command", function(){

    let mockRequest = {
        body: {
            "command": "/generate",
            "user_id": "missing_user",
            "user_name": "austo",
            "channel_id": "C4Z7F8XMW",
            "channel_name": "The Arena",
            "token": "a6qLRgANE3lHNDP50zb0vmoJ",
            "team_id": "T4ZAGTM1V",
            "team_domain": "austo",
            "text": "",
            "response_url": "https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT4ZAGTM1V%2F239499725731%2Fb0wOCK18eeETsD0mvH0LqYEB&trigger_id=239057170097.169356939063.08e9efc327159fc04d0a0845821c2a3a"
        }
    };

    let numberOfUsersBeforeTest = Object.keys(game.state.user).length;

    let slackResponseTemplateReturned = slackRequest.processSlashCommand(mockRequest);

    let numberOfUsersAfterTest = Object.keys(game.state.user).length;

    it("should increase the # of users by 1", function(){
        assert.equal(numberOfUsersAfterTest, numberOfUsersBeforeTest + 1);
    })
});*/


/*
describe("Testing slackRequest.getSlashCommandResponse() when user_id is not yet in DB", function(){

    let mockRequest = {
        "command": "/generate",
        "user_id": "missing_user",
        "user_name": "austo",
        "channel_id": "C4Z7F8XMW",
        "channel_name": "The Arena",
        "token": "a6qLRgANE3lHNDP50zb0vmoJ",
        "team_id": "T4ZAGTM1V",
        "team_domain": "austo",
        "text": "",
        "response_url": "https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT4ZAGTM1V%2F239499725731%2Fb0wOCK18eeETsD0mvH0LqYEB&trigger_id=239057170097.169356939063.08e9efc327159fc04d0a0845821c2a3a"
    };

    let slackResponseTemplateReturned = slackRequest.getSlashCommandResponse(mockRequest, game);

    testSlackResponseFormat(slackResponseTemplateReturned);

    console.log('slackResponseTemplateReturned: ', slackResponseTemplateReturned)

});*/
/*
describe("Testing slackRequest.getInteractiveMessageResponse()", function(){

    describe("where", function(){

        //Real slack interactive messages have a .payload property.  I've removed this since my processor will remove it before passing to processInteractiveMessage() function
        var mockRequest = {
            "actions":[{
                "name":"classSelection",
                "type":"button",
                "value":"-Kird8_Vef-8Ej2aShaO"
            }],
            //"callback_id":"command:action/actionList:Shop/shopList",
            "callback_id":"command:generate/generateCharacterConfirmation:yes/selectCharacterClassMenu",
            "team":{
                "id":"T4ZAGTM1V","domain":"austo"
            },
            "channel":{
                "id":"C4Z4P1BUH","name":"The Town Square"
            },
            "user":{
                "id":"U4ZA6CCBG","name":"austo"
            },
            "action_ts":"1492112423.749941",
            "message_ts":"1492110630.089291",
            "attachment_id":"1",
            "token":"a6qLRgANE3lHNDP50zb0vmoJ",
            "is_app_unfurl":false,
            "original_message":{
                "text":"","bot_id":"B4YMB7WDS","attachments":[{
                    "callback_id":"wopr_game","fallback":"You are unable to choose an action","text":"Choose an action","id":1,"color":"3AA3E3","actions":[{
                        "id":"1","name":"action","text":"Attack","type":"button","value":"attack","style":"danger","confirm":{
                            "text":"This action will put your character on the offensive!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"
                        }}, {
                        "id":"2","name":"action","text":"Defend","type":"button","value":"defend","style":"primary","confirm":{
                            "text":"This action will defend your character from possible attacks!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"
                        }
                    }
                    ]
                }],
                "type":"message","subtype":"bot_message","ts":"1492110630.089291"
            },
            "response_url":"https:\/\/hooks.slack.com\/actionControllers\/T4ZAGTM1V\/169780351094\/JjI9vAXZVLtcuQdJwUPowS9m"
        };

        describe("mockRequest equals: " + mockRequest, function(){

            let slackResponseTemplateReturned = slackRequest.getInteractiveMessageResponse(mockRequest, game);

            testSlackResponseFormat(slackResponseTemplateReturned);

            console.log('slackResponseTemplateReturned: ', slackResponseTemplateReturned)

        })
    });

});
*/