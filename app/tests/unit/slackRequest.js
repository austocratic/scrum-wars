'use strict';

var request = require('request');
var assert = require('assert');

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

//Standard set of tests to verify the argument passed is formatted for slack messaging
function testSlackResponseFormat(responseToTest){
    describe("testing the format of the value to ensure that it is formatted for Slack, value testing: " + JSON.stringify(responseToTest), function() {
        it("should return a value (should not be undefined) ", function () {
            assert(responseToTest);
        });

        //If the message has an attachment property, test attachment specific formats
        if (responseToTest.attachments) {
            describe("the response template has an attachment property, testing attachment specific format", function () {

                it("should be an array (.length should not be undefined)", function () {
                    assert(responseToTest.attachments.length);
                });

                if (responseToTest.attachments.length > 0) {
                    describe("the response templates attachment array has at least one element, testing each element", function () {

                        responseToTest.attachments.forEach(eachAttachment => {
                            it("should have a .callback_id property", function () {
                                assert(eachAttachment.callback_id);
                            });
                            it("should have a .fallback property", function () {
                                assert(eachAttachment.fallback);
                            });
                            if (eachAttachment.actions) {
                                describe("the attachment has .actions property, testing actions specific format", function () {
                                    it("action should be an array (.length should not be undefined)", function () {
                                        assert(eachAttachment.actions.length);
                                    });
                                    if (eachAttachment.actions.length > 0) {
                                        describe("the attachment element has at least one action element, testing each element", function () {
                                            eachAttachment.actions.forEach(eachAction => {
                                                it("should have a .name property", function () {
                                                    assert(eachAction.name);
                                                });
                                                it("should have a .text property", function () {
                                                    assert(eachAction.text);
                                                });
                                                it("should have a .type property", function () {
                                                    assert(eachAction.type);
                                                });
                                                if (eachAction.style) {
                                                    describe("the action has a .style property", function () {
                                                        it("should have a value of 'default', 'primary', or 'danger'", function () {
                                                            assert(
                                                                eachAction.style === 'default' ||
                                                                eachAction.style === 'primary' ||
                                                                eachAction.style === 'danger'
                                                            )
                                                        })
                                                    })
                                                }
                                            })
                                        })
                                    }
                                })
                            }
                        })
                    })
                } else {
                    describe("the response templates attachment array is empty, testing format specific to no attachment", function () {
                        it("should have a text property (.text property reference should not be undefined)", function () {
                            assert(responseToTest.text);
                        });
                    })
                }
            });
        }

        else {
            describe("the response template does not have an attachment property, testing format specific to no attachment", function () {
                it("should have a text property (.text property reference should not be undefined)", function () {
                    assert(responseToTest.text);
                });
            })
        }
    });
}


describe("Testing slackRequest.getSlashCommandResponse()", function(){

    let mockRequest = {
        "command": "generate",
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

});

describe("Testing slackRequest.getInteractiveMessageResponse()", function(){

    //Real slack interactive messages have a .payload property.  I;ve removed this since my processor will remove it before passing to processInteractiveMessage() function
    var mockRequest = {
        "actions":[{
            "name":"rusty longsword",
            "type":"button",
            //"value":"-KjGQ1IPuwE24t4LPPNd"
            "value":"yes"
        }],
        //"callback_id":"command:action/actionList:Shop/shopList",
        "callback_id":"command:action/actionList:Shop/generateCharacterConfirmation",
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
        "response_url":"https:\/\/hooks.slack.com\/actions\/T4ZAGTM1V\/169780351094\/JjI9vAXZVLtcuQdJwUPowS9m"
    };

    let slackResponseTemplateReturned = slackRequest.getInteractiveMessageResponse(mockRequest, game);

    testSlackResponseFormat(slackResponseTemplateReturned);

    console.log('slackResponseTemplateReturned: ', slackResponseTemplateReturned)

});

/*
describe.skip("Testing slackRequest.processRequest()", function() {

    describe("with ", function() {

        let gameContext = 'generateCharacterConfirmation';
        let userSelection = 'yes';
        
        describe("gameContext " + gameContext + " & user selection " +  userSelection, function() {

            let slackResponseTemplate = {};

            let testOriginalCharacterID = 'a7ad15dd1052e7e7ef8a';

            let playerCharacter = {
                "actions": [{
                    "action_id": "-Kjpe29q_fDkJG-73AQO",
                    "is_available": 1,
                    "turn_available": 0,
                    "turn_used": 0
                }, {
                    "action_id": "-KjpeJT7Oct3ZCtLhENO",
                    "is_available": 1,
                    "turn_available": 0,
                    "turn_used": 0
                }, {
                    "action_id": "-KkdduB9XuB46EsxqwIX",
                    "is_available": 1,
                    "turn_available": 0,
                    "turn_used": 0
                }, {
                    "action_id": "-KkJVqtBIhpAKBfz9tcb",
                    "is_available": 1,
                    "turn_available": 0,
                    "turn_used": 0
                }, {
                    "action_id": "-KqtOcn7MapqMfnGIZvo",
                    "is_available": 1,
                    "turn_available": 0,
                    "turn_used": 0
                }, {
                    "action_id": "-KrJaBvyYDGrNVfcaAd0",
                    "is_available": 1,
                    "turn_available": 0,
                    "turn_used": 0
                }],
                "active": 1,
                "armor": 0,
                "avatar": "app/assets/fullSize/character_avatar/female/f_08.png",
                "class_id": "-KircnK2x1_31EQiAYlk",
                "dexterity": 12,
                "gender": "female",
                "gold": 80,
                "hit_points": 100,
                "intelligence": 18,
                "inventory": [{
                    "equipment_slot_id": ["-KmTV24FelP7T8rdKLEx"],
                    "equipment_slots": ["-KmTV24FelP7T8rdKLEx"],
                    "is_equipped": 1,
                    "item_id": "-KjGQ1IPuwE24t4LPPNd",
                    "modifiers": {
                        "modified_strength": 5
                    },
                    "name": "rusty longsword"
                }, {
                    "equipment_slot_id": ["-KmTV24FelP7T8rdKLEx"],
                    "equipment_slots": ["-KmTV24FelP7T8rdKLEx"],
                    "is_equipped": 1,
                    "item_id": "-KjGQPbo-96j_Uikhjqh",
                    "modifiers": {
                        "modified_dexterity": 2,
                        "modified_strength": 2
                    },
                    "name": "rusty dagger"
                }],
                "is_hidden": 0,
                "level": 1,
                "match_wins": 0,
                "max_hit_points": 100,
                "modified_dexterity": 14,
                "modified_intelligence": 18,
                "modified_strength": 11,
                "modified_toughness": 6,
                "name": "Sindria",
                "strength": 4,
                "toughness": 6,
                "user_id": "-Kp1Y_uOmv_EwNc8mTj4",
                "zone_id": "-Khu9Zazk5XdFX9fD2Y8"
            };

            let slackResponseTemplateReturned = slackRequest.processRequest(gameContext, userSelection, {
                game,
                slackResponseTemplate,
                slackCallback,
                user,
                playerCharacter
            });

            testSlackResponseFormat(slackResponseTemplateReturned);

            it("should update user ID " + user.id + "'s character_id, so user's character should not equal " + testOriginalCharacterID, function () {
                assert.notEqual(user.props.character_id, testOriginalCharacterID);
            });
        });
    });

    describe("with ", function() {

        let gameContext = 'generateCharacterConfirmation';
        let userSelection = 'no';

        describe("gameContext " + gameContext + " & user selection " +  userSelection, function() {

            let slackResponseTemplate = {};

            let slackResponseTemplateReturned = slackRequest.processRequest(gameContext, userSelection, {
                slackResponseTemplate
            });

            testSlackResponseFormat(slackResponseTemplateReturned);

        });
    });

    describe("with ", function(){

        let gameContext = 'selectGenderMenu';
        let userSelection = 'male';

        describe("gameContext " + gameContext + " & user selection " +  userSelection, function() {

            let slackResponseTemplate = {};

            //Mock a character that does not have gender property set yet
            let testCharacterID = 'charNoGender';

            let playerCharacter = new Character(game.state, testCharacterID);

            let slackResponseTemplateReturned = slackRequest.processRequest(gameContext, userSelection, {
                game,
                slackResponseTemplate,
                userSelection,
                slackCallback,
                playerCharacter
            });

            testSlackResponseFormat(slackResponseTemplateReturned);

        });
    });

    describe("with ", function(){

        let gameContext = 'command';
        let userSelection = 'action';

        describe("gameContext " + gameContext + " & user selection " +  userSelection, function() {

            describe("where the player typed the /action command in a channel that the player's character is not in", function(){

             let slackResponseTemplate = {};

             let testCharacterID = 'd130618f3a221f672cfc';

             //Arena channel ID
             //slackPayload.channel_id
             let requestChannelID = 'C4Z7F8XMW';

                let playerCharacter = new Character(game.state, testCharacterID);

                let requestZone = new Zone(game.state, requestChannelID);

                //Overwrite the player character's zone to ensure the character is in the town
                playerCharacter.props.zone_id = '-Khu9Zazk5XdFX9fD2Y8';

                let slackResponseTemplateReturned = slackRequest.processRequest(gameContext, userSelection, {
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
             let testCharacterID = 'd130618f3a221f672cfc';

             //Arena channel ID
             //slackPayload.channel_id
             let requestChannelID = 'C4Z7F8XMW';

             let playerCharacter = new Character(game.state, testCharacterID);

             let requestZone = new Zone(game.state, requestChannelID);
                
                let currentMatch = new Match(game.state, game.state.global_state.match_id);

                //Overwrite the player character's zone to ensure the character is in the arena
                playerCharacter.props.zone_id = '-Khu9Ti4cn9PQ2Q1TSBT';
                
                let slackResponseTemplateReturned = slackRequest.processRequest(gameContext, userSelection, {
                    game,
                    slackResponseTemplate,
                    requestZone,
                    playerCharacter,
                    currentMatch
                });

                testSlackResponseFormat(slackResponseTemplateReturned);
            });
        });
    });

    describe("with ", function(){

        let gameContext = 'command';
        let userSelection = 'generate';

        describe("gameContext " + gameContext + " & user selection " +  userSelection, function() {

            let slackResponseTemplate = {};

            let slackResponseTemplateReturned = slackRequest.processRequest(gameContext, userSelection, {
                slackResponseTemplate
            });

            testSlackResponseFormat(slackResponseTemplateReturned);

        });
    });

    describe("with ", function(){

        let gameContext = 'command';
        let userSelection = 'profile';

        describe("gameContext " + gameContext + " & user selection " +  userSelection, function() {

            let slackResponseTemplate = {};

            let testCharacterID = 'd130618f3a221f672cfc';

            let playerCharacter = new Character(game.state, testCharacterID);

            let characterClass = new Class(game.state, playerCharacter.props.class_id);

            let slackResponseTemplateReturned = slackRequest.processRequest(gameContext, userSelection, {
                slackResponseTemplate,
                characterClass,
                playerCharacter
            });

            testSlackResponseFormat(slackResponseTemplateReturned);

        });
    });

    describe("with ", function(){

        let gameContext = 'command';
        let userSelection = 'travel';

        describe("gameContext " + gameContext + " & user selection " +  userSelection, function() {

            let slackResponseTemplate = {};

            let testCharacterID = 'd130618f3a221f672cfc';

            let playerCharacter = new Character(game.state, testCharacterID);

            //Arena channel ID
            //slackPayload.channel_id
            let requestChannelID = 'C4Z7F8XMW';

            let requestZone = new Zone(game.state, requestChannelID);

            let slackResponseTemplateReturned = slackRequest.processRequest(gameContext, userSelection, {
                slackResponseTemplate,
                requestZone,
                playerCharacter
            });

            testSlackResponseFormat(slackResponseTemplateReturned);

        });
    });

    describe("with ", function(){

        let gameContext = 'command';
        let userSelection = 'name';

        describe("gameContext " + gameContext + " & user selection " +  userSelection, function() {

            describe("when there is not a character with the inputted name", function(){

                let slackResponseTemplate = {};

                let testCharacterID = 'd130618f3a221f672cfc';

                let playerCharacter = new Character(game.state, testCharacterID);

                let slackTextInput = 'Test Name';

                let slackResponseTemplateReturned = slackRequest.processRequest(gameContext, userSelection, {
                    game,
                    slackResponseTemplate,
                    playerCharacter,
                    slackTextInput
                });

                testSlackResponseFormat(slackResponseTemplateReturned);

            });
        });
    });
});*/