'use strict';

var request = require('request');
var assert = require('assert');

//var Alert = require('../libraries/slack').Alert;


//var slackMessage = process.env.SLACK_HOOK;

//var PostProfile_url = "http://localhost:3000/api/stripe/operating";
var commandsURL = "http://localhost:3000/api/commands";
var interactiveMessagesURL = "http://localhost:3000/api/interactive-messages";



var testRequest = {
    method: "POST",
    json: true
};


var testProfile = {
    "attachments": [
        {
            "image_url": "http://orig06.deviantart.net/23db/f/2013/201/4/6/paladin_basic_version_by_thomaswievegg-d6eaz66.jpg",
            "fields": [
                {
                    "title": "Profile",
                    "value": "Montaigne",
                    "short": false
                }
            ]
        },
        {
            "fields": [
                {
                    "title": "Health",
                    "value": 10,
                    "short": true
                },
                {
                    "title": "Attack",
                    "value": 15,
                    "short": true
                }
            ]
        }
    ]
};

var testActionList = {
    "attachments": [
        {
            "text": "Choose an action",
            "fallback": "You are unable to choose an action",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "action",
                    "text": "Attack",
                    "style": "danger",
                    "type": "button",
                    "value": "attack"/*,
                 "confirm": {
                 "title": "Are you sure?",
                 "text": "This action will put your character on the offensive!",
                 "ok_text": "Yes",
                 "dismiss_text": "No"
                 }*/
                },
                {
                    "name": "action",
                    "text": "Defend",
                    "style": "primary",
                    "type": "button",
                    "value": "defend"/*,
                 "confirm": {
                 "title": "Are you sure?",
                 "text": "This action will defend your character from possible attacks!",
                 "ok_text": "Yes",
                 "dismiss_text": "No"
                 }*/
                }
            ]
        }
    ]
};

var testAttackMessage = { "text": "Monty lunges forward with a powerful strike and lands a crushing blow on Monty for 8 points of damage!",
    "attachments":
        [ { "fallback": "You are unable to choose an action",
            "callback_id": "attackCharacterComplete",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [] } ],
    "response_type": "in_channel" };

var testActionAttack = {"payload": {"actions":[{"name":"-Kkxf1ukVSF9VV6mIPlG","type":"button","value":"-Kkxf1ukVSF9VV6mIPlG"}],"callback_id":"command:action/actionList:-Kjpe29q_fDkJG-73AQO/characterList","team":{"id":"T4ZAGTM1V","domain":"austo"},"channel":{"id":"C4YKJ3QBC","name":"general"},"user":{"id":"U4ZA6CCBG","name":"austo"},"action_ts":"1492112423.749941","message_ts":"1492110630.089291","attachment_id":"1","token":"a6qLRgANE3lHNDP50zb0vmoJ","is_app_unfurl":false,"original_message":{"text":"","bot_id":"B4YMB7WDS","attachments":[{"callback_id":"wopr_game","fallback":"You are unable to choose an action","text":"Choose an action","id":1,"color":"3AA3E3","actions":[{"id":"1","name":"action","text":"Attack","type":"button","value":"attack","style":"danger","confirm":{"text":"This action will put your character on the offensive!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}},{"id":"2","name":"action","text":"Defend","type":"button","value":"defend","style":"primary","confirm":{"text":"This action will defend your character from possible attacks!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}}]}],"type":"message","subtype":"bot_message","ts":"1492110630.089291"},"response_url":"https:\/\/hooks.slack.com\/actions\/T4ZAGTM1V\/169780351094\/JjI9vAXZVLtcuQdJwUPowS9m"}};

var testCommandGenerate = {"payload": {"actions":[{"name":"warrior","type":"button","value":"warrior"}],"callback_id":"characterClass","team":{"id":"T4ZAGTM1V","domain":"austo"},"channel":{"id":"C4YKJ3QBC","name":"general"},"user":{"id":"U4ZA6CCBG","name":"austo"},"action_ts":"1492315022.545654","message_ts":"1492315019.000002","attachment_id":"1","token":"a6qLRgANE3lHNDP50zb0vmoJ","is_app_unfurl":false,"response_url":"https:\/\/hooks.slack.com\/actions\/T4ZAGTM1V\/170497210615\/RlYLVSUbX7HevfdWJNSg7ycz"}};


var testCommandGenerate = {
    "command": "/generate",
    "user_id": "U4ZA6CCBG",
    "user_name": "austo",
    "channel_id": "C4YKJ3QBC",
    "channel_name": "general"
};

var testCommandTravelArena = {
    "command": "/travel",
    "user_id": "U4ZA6CCBG",
    "user_name": "austo",
    "channel_id": "C4Z7F8XMW",
    "channel_name": "general"
};

var testCommandTravelTown = {
    "command": "/travel",
    "user_id": "U4ZA6CCBG",
    "user_name": "austo",
    "channel_id": "C4Z4P1BUH",
    "channel_name": "general"
};

var testCommandName = {
    "command": "/name",
    "user_id": "U4ZA6CCBG",
    "user_name": "austo",
    "channel_id": "C4Z4P1BUH",
    "channel_name": "general",
    "text": "Freddy"
};

var testCommandAction = {
    "command": "/action",
    "user_id": "U4ZA6CCBG",
    "user_name": "austo",
    "channel_id": "C4Z4P1BUH",
    "channel_name": "general",
    "text": ""
};

var testCommandProfile = {
    "team_id": "T4ZAGTM1V",
    "team_domain": "austo",
    "command": "/profile",
    "user_id": "U4ZA6CCBG",
    "user_name": "austo",
    "channel_id": "C4Z7F8XMW",
    "channel_name": "arena",
    "text": ""
};

var testCallbackCharacterSelectionNew = {"payload": {"actions":[{"name":"yes","type":"button","value":"yes"}],"callback_id":"command:generate/generateCharacterConfirmation","team":{"id":"T4ZAGTM1V","domain":"austo"},"channel":{"id":"C4Z7F8XMW","name":"arena"},"user":{"id":"U4ZA6CCBG","name":"austo"},"action_ts":"1492112423.749941","message_ts":"1492110630.089291","attachment_id":"1","token":"a6qLRgANE3lHNDP50zb0vmoJ","is_app_unfurl":false,"original_message":{"text":"","bot_id":"B4YMB7WDS","attachments":[{"callback_id":"wopr_game","fallback":"You are unable to choose an action","text":"Choose an action","id":1,"color":"3AA3E3","actions":[{"id":"1","name":"action","text":"Attack","type":"button","value":"attack","style":"danger","confirm":{"text":"This action will put your character on the offensive!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}},{"id":"2","name":"action","text":"Defend","type":"button","value":"defend","style":"primary","confirm":{"text":"This action will defend your character from possible attacks!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}}]}],"type":"message","subtype":"bot_message","ts":"1492110630.089291"},"response_url":"https:\/\/hooks.slack.com\/actions\/T4ZAGTM1V\/169780351094\/JjI9vAXZVLtcuQdJwUPowS9m"}};

var testCallbackCharacterSelectionClass = {"payload": {"actions":[{"name":"class","type":"button","value":"Warrior"}],"callback_id":"characterSelectionClass","team":{"id":"T4ZAGTM1V","domain":"austo"},"channel":{"id":"C4YKJ3QBC","name":"general"},"user":{"id":"U55U8F5B7","name":"austo"},"action_ts":"1492112423.749941","message_ts":"1492110630.089291","attachment_id":"1","token":"a6qLRgANE3lHNDP50zb0vmoJ","is_app_unfurl":false,"original_message":{"text":"","bot_id":"B4YMB7WDS","attachments":[{"callback_id":"wopr_game","fallback":"You are unable to choose an action","text":"Choose an action","id":1,"color":"3AA3E3","actions":[{"id":"1","name":"action","text":"Attack","type":"button","value":"attack","style":"danger","confirm":{"text":"This action will put your character on the offensive!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}},{"id":"2","name":"action","text":"Defend","type":"button","value":"defend","style":"primary","confirm":{"text":"This action will defend your character from possible attacks!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}}]}],"type":"message","subtype":"bot_message","ts":"1492110630.089291"},"response_url":"https:\/\/hooks.slack.com\/actions\/T4ZAGTM1V\/169780351094\/JjI9vAXZVLtcuQdJwUPowS9m"}};

var testCallbackplayerActionSelection = {"payload": {"actions":[{"name":"class","type":"button","value":"attack"}],"callback_id":"actionMenu","team":{"id":"T4ZAGTM1V","domain":"austo"},"channel":{"id":"C4YKJ3QBC","name":"general"},"user":{"id":"U4ZA6CCBG","name":"austo"},"action_ts":"1492112423.749941","message_ts":"1492110630.089291","attachment_id":"1","token":"a6qLRgANE3lHNDP50zb0vmoJ","is_app_unfurl":false,"original_message":{"text":"","bot_id":"B4YMB7WDS","attachments":[{"callback_id":"wopr_game","fallback":"You are unable to choose an action","text":"Choose an action","id":1,"color":"3AA3E3","actions":[{"id":"1","name":"action","text":"Attack","type":"button","value":"attack","style":"danger","confirm":{"text":"This action will put your character on the offensive!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}},{"id":"2","name":"action","text":"Defend","type":"button","value":"defend","style":"primary","confirm":{"text":"This action will defend your character from possible attacks!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}}]}],"type":"message","subtype":"bot_message","ts":"1492110630.089291"},"response_url":"https:\/\/hooks.slack.com\/actions\/T4ZAGTM1V\/169780351094\/JjI9vAXZVLtcuQdJwUPowS9m"}};

var testCallbackplayerActionSelection_shop = {"payload": {"actions":[{"name":"Shop","type":"button","value":"Shop"}],"callback_id":"/actionList","team":{"id":"T4ZAGTM1V","domain":"austo"},"channel":{"id":"C4Z4P1BUH","name":"general"},"user":{"id":"U4ZA6CCBG","name":"austo"},"action_ts":"1492112423.749941","message_ts":"1492110630.089291","attachment_id":"1","token":"a6qLRgANE3lHNDP50zb0vmoJ","is_app_unfurl":false,"original_message":{"text":"","bot_id":"B4YMB7WDS","attachments":[{"callback_id":"wopr_game","fallback":"You are unable to choose an action","text":"Choose an action","id":1,"color":"3AA3E3","actions":[{"id":"1","name":"action","text":"Attack","type":"button","value":"attack","style":"danger","confirm":{"text":"This action will put your character on the offensive!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}},{"id":"2","name":"action","text":"Defend","type":"button","value":"defend","style":"primary","confirm":{"text":"This action will defend your character from possible attacks!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}}]}],"type":"message","subtype":"bot_message","ts":"1492110630.089291"},"response_url":"https:\/\/hooks.slack.com\/actions\/T4ZAGTM1V\/169780351094\/JjI9vAXZVLtcuQdJwUPowS9m"}};

var testCallbackShopItemSelected = {"payload": {"actions":[{"name":"rusty longsword","type":"button","value":"-KjGQ1IPuwE24t4LPPNd"}],"callback_id":":/actionList:Shop/shopList","team":{"id":"T4ZAGTM1V","domain":"austo"},"channel":{"id":"C4YKJ3QBC","name":"general"},"user":{"id":"U4ZA6CCBG","name":"austo"},"action_ts":"1492112423.749941","message_ts":"1492110630.089291","attachment_id":"1","token":"a6qLRgANE3lHNDP50zb0vmoJ","is_app_unfurl":false,"original_message":{"text":"","bot_id":"B4YMB7WDS","attachments":[{"callback_id":"wopr_game","fallback":"You are unable to choose an action","text":"Choose an action","id":1,"color":"3AA3E3","actions":[{"id":"1","name":"action","text":"Attack","type":"button","value":"attack","style":"danger","confirm":{"text":"This action will put your character on the offensive!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}},{"id":"2","name":"action","text":"Defend","type":"button","value":"defend","style":"primary","confirm":{"text":"This action will defend your character from possible attacks!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}}]}],"type":"message","subtype":"bot_message","ts":"1492110630.089291"},"response_url":"https:\/\/hooks.slack.com\/actions\/T4ZAGTM1V\/169780351094\/JjI9vAXZVLtcuQdJwUPowS9m"}};

var testCallbackShopItemSelectedConfirm = {"payload":  {"actions":[{"name":"class","type":"button","value":"no"}],"callback_id":"shopPurchaseConfirm","team":{"id":"T4ZAGTM1V","domain":"austo"},"channel":{"id":"C4Z4P1BUH","name":"town"},"user":{"id":"U4ZA6CCBG","name":"austo"},"action_ts":"1494119116.939879","message_ts":"1494119112.000009","attachment_id":"1","token":"a6qLRgANE3lHNDP50zb0vmoJ","is_app_unfurl":false,"response_url":"https://hooks.slack.com/actions/T4ZAGTM1V/180613324358/NksqMUdQqN8HIDQhETh5dsWf"}}

var testCallbackAttackCharacterSelection = {"payload": {"actions":[{"name":"-Kkxf1ukVSF9VV6mIPlG","type":"button","value":"-Kkxf1ukVSF9VV6mIPlG"}],"callback_id":"attackCharacterSelection","team":{"id":"T4ZAGTM1V","domain":"austo"},"channel":{"id":"C4YKJ3QBC","name":"general"},"user":{"id":"U4ZA6CCBG","name":"austo"},"action_ts":"1492112423.749941","message_ts":"1492110630.089291","attachment_id":"1","token":"a6qLRgANE3lHNDP50zb0vmoJ","is_app_unfurl":false,"original_message":{"text":"","bot_id":"B4YMB7WDS","attachments":[{"callback_id":"wopr_game","fallback":"You are unable to choose an action","text":"Choose an action","id":1,"color":"3AA3E3","actions":[{"id":"1","name":"action","text":"Attack","type":"button","value":"attack","style":"danger","confirm":{"text":"This action will put your character on the offensive!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}},{"id":"2","name":"action","text":"Defend","type":"button","value":"defend","style":"primary","confirm":{"text":"This action will defend your character from possible attacks!","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}}]}],"type":"message","subtype":"bot_message","ts":"1492110630.089291"},"response_url":"https:\/\/hooks.slack.com\/actions\/T4ZAGTM1V\/169780351094\/JjI9vAXZVLtcuQdJwUPowS9m"}};


/*
 describe("Send testAttackMessage message", function() {

 it("should return a success & display the action options in slack", function(done) {

 testRequest.uri = slackHook;
 testRequest.body = testAttackMessage;

 request(testRequest, function(error, response, body) {

 assert.equal(response.statusCode, 200);

 done();
 });

 });
 });*/

/*
 describe("Get action list", function() {

 it("should return a success & display the action options in slack", function(done) {

 testRequest.uri = slackHook;
 testRequest.body = testActionList;

 request(testRequest, function(error, response, body) {

 assert.equal(response.statusCode, 200);

 done();
 });

 });
 });*/
/*
describe.skip("Call router w/ a mock of /profile", function() {

    console.log('calling router');

    it("should do stuff", function(done) {
        testRequest.uri = commandsURL;
        testRequest.body = testCommandProfile;

        request(testRequest, function (error, response, body) {
            
            console.log('Response: ', response.statusCode);

            assert.equal(response.statusCode, 200);

            done();
        });
    });
});*/

describe("Call router w/ a mock of character selection Yes", function() {

    console.log('calling router');

    it("should do stuff", function(done) {
        testRequest.uri = interactiveMessagesURL;
        testRequest.body = testCallbackCharacterSelectionNew;

        request(testRequest, function (error, response, body) {

            console.log('Response: ', response.statusCode);

            assert.equal(response.statusCode, 200);

            done();
        });
    });
});


/*
 describe("Trigger action", function() {

     it("should return a success & trigger the next step in the action sequence", function(done) {

         testRequest.uri = interactiveMessagesURL;
         testRequest.body = testActionAttack;

         request(testRequest, function(error, response, body) {

             assert.equal(response.statusCode, 200);

             done();
         });
     });
 });*/
/*
 describe("Mimic the /generate command", function() {

 it("should return a success & trigger the next interactiveMessage function", function(done) {

 testRequest.uri = commandsURL;
 testRequest.body = testCommandGenerate;

 request(testRequest, function(error, response, body) {

 assert.equal(response.statusCode, 200);

 done();
 });
 });
 });*/
/*
 describe("Mimic the /profile command", function() {

 it("should return a success & trigger the next interactiveMessage function", function(done) {

 testRequest.uri = commandsURL;
 testRequest.body = testCommandProfile;

 request(testRequest, function(error, response, body) {

 assert.equal(response.statusCode, 200);

 done();
 });
 });
 });*/
/*
 describe("Mimic the /travel command to the arena", function() {

     it("should return a success & trigger the next interactiveMessage function", function(done) {
    
         testRequest.uri = commandsURL;
         testRequest.body = testCommandTravelArena;
        
         request(testRequest, function(error, response, body) {
        
         assert.equal(response.statusCode, 200);
        
         done();
         });
     });
 });*/

/*
 describe("Mimic the /name command", function() {

     it("should return a success & trigger the next interactiveMessage function", function(done) {

         testRequest.uri = commandsURL;
         testRequest.body = testCommandName;

         request(testRequest, function(error, response, body) {

         assert.equal(response.statusCode, 200);

         done();
         });
     });
 });*/

/*
describe("Mimic the /action command", function() {

    it("should return a success & trigger the next interactiveMessage function", function(done) {

        testRequest.uri = commandsURL;
        testRequest.body = testCommandAction;

        request(testRequest, function(error, response, body) {

            assert.equal(response.statusCode, 200);

            done();
        });
    });
});*/

/*
 describe("Mimic the callback from characterSelectionNew", function() {

     it("should return a success & trigger the next interactiveMessage function", function(done) {
    
         testRequest.uri = interactiveMessagesURL;
         testRequest.body = testCallbackCharacterSelectionNew;
        
         request(testRequest, function(error, response, body) {
        
         assert.equal(response.statusCode, 200);
        
         done();
         });
     });
 });*/
/*
 describe("Mimic the callback from characterSelectionClass", function() {

 it("should return a success & trigger the next interactiveMessage function", function(done) {

 testRequest.uri = interactiveMessagesURL;
 testRequest.body = testCallbackCharacterSelectionClass;

 request(testRequest, function(error, response, body) {

 assert.equal(response.statusCode, 200);

 done();
 });
 });
 });*/
/*
 describe("Mimic the callback from playerActionSelection", function() {

 it("should return a success & trigger the next interactiveMessage function", function(done) {

 testRequest.uri = interactiveMessagesURL;
 testRequest.body = testCallbackplayerActionSelection;

 request(testRequest, function(error, response, body) {

 assert.equal(response.statusCode, 200);

 done();
 });
 });
 });*/
/*
 describe("Mimic the callback from attackCharacterSelection", function() {

 it("should return a success & trigger the next interactiveMessage function", function(done) {

 testRequest.uri = interactiveMessagesURL;
 testRequest.body = testCallbackAttackCharacterSelection;

 request(testRequest, function(error, response, body) {

 assert.equal(response.statusCode, 200);

 done();
 });
 });
 });*/
/*
 describe("Mimic the callback from playerActionSelection for SHOP", function() {

     it("should return a success & trigger the next interactiveMessage function", function(done) {

         testRequest.uri = interactiveMessagesURL;
         testRequest.body = testCallbackplayerActionSelection_shop;

         request(testRequest, function(error, response, body) {

         assert.equal(response.statusCode, 200);

         done();
         });
     });
 });*/
/*
 describe("Mimic the callback from playerActionSelection for selecting an item", function() {

     it("should return a success & trigger the next interactiveMessage function", function(done) {

         testRequest.uri = interactiveMessagesURL;
         testRequest.body = testCallbackShopItemSelected;

         request(testRequest, function(error, response, body) {

         assert.equal(response.statusCode, 200);

         done();
         });
     });
 });*/
/*
 describe("Mimic the callback from testCallbackShopItemSelectedConfirm for selecting an item", function() {

 it("should return a success & trigger the next interactiveMessage function", function(done) {

 testRequest.uri = interactiveMessagesURL;
 testRequest.body = testCallbackShopItemSelectedConfirm;

 request(testRequest, function(error, response, body) {

 assert.equal(response.statusCode, 200);

 done();
 });
 });
 });*/