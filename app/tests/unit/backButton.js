"use strict";

const assert = require('assert');
const modifyCallbackForBack = require('../../controllers/backButton').modifyCallbackForBack;
const modifyUserActionNameSelection = require('../../controllers/backButton').modifyUserActionNameSelection;
const processBackButton = require('../../controllers/backButton').processBackButton;

const testDB = require('../testDB');
const Game = require('../../models/Game').Game;
const Character = require('../../models/Character').Character;
const User = require('../../models/User').User;
const Zone = require('../../models/Zone').Zone;
const Match = require('../../models/Match').Match;
const Class = require('../../models/Class').Class;


describe("Testing back button functionality", function() {
    /*
    describe("where the callback string is 4 game contexts long", function(){
        const slackCallback = 'command:action/selectActionMenu:shop:-KkJVqtBIhpAKBfz9tcb/shopMainMenu:purchaseButton:purchaseButton/purchaseItemConfirmation';

        let updatedSlackCallback = modifyCallbackForBack(slackCallback);

        it("should equal command:action/selectActionMenu:shop/selectShopItemMenu", function(){
            assert.equal(updatedSlackCallback, 'command:action/selectActionMenu')
        })
    });

    describe("where the callback string is 3 game contexts long", function(){
        const slackCallback = 'command:action/selectActionMenu:shop:-KkJVqtBIhpAKBfz9tcb/shopMainMenu';

        let updatedSlackCallback = modifyCallbackForBack(slackCallback);

        it("should equal command", function(){
            assert.equal(updatedSlackCallback, 'command')
        });
    });*/

    //Example: "Exit" button on a main menu
    describe("where the callback string is 2 game contexts long", function(){
        const slackCallback = 'command:action/selectActionMenu';

        let updatedSlackCallback = modifyCallbackForBack(slackCallback);

        it("should equal command", function(){
            assert.equal(updatedSlackCallback, 'command')
        });
    });
});
/*
describe("Testing back button functionality", function() {
    
    describe("where the prior value selected was shop", function(){
        const slackCallback = 'command:action/selectActionMenu:shop:-KkJVqtBIhpAKBfz9tcb/shopMainMenu:purchaseButton:purchaseButton/purchaseItemConfirmation';

        let updatedActionName = modifyUserActionNameSelection(slackCallback);

        it("should equal shop", function(){
            assert.equal(updatedActionName, 'shop')
        })
    });


    describe("where the prior value selected was equipment", function(){
        const slackCallback = 'command:profile/characterProfileMenu:equipment/selectEquipmentMenu';

        let updatedActionName = modifyUserActionNameSelection(slackCallback);

        it("should equal shop", function(){
            assert.equal(updatedActionName, 'profile')
        })
    });
});

describe("Testing processBackButton functionality", function(){

    let game = new Game();
    game.state = testDB;

    let mockRequest = {
        "actions":[{
            "name":"back",
            "type":"button",
            "value":"back"
        }],
        //"callback_id":"command:action/actionList:Shop/shopList",
        "callback_id":"command:action/selectActionMenu:shop:-KkJVqtBIhpAKBfz9tcb/shopMainMenu:purchaseButton:purchaseButton/shopPurchaseMenu:itemList:-sfdsfsfd/itemDetailMenu",
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

    let gameObjects = {
        slackResponseTemplate: {},
        targetCharacter: new Character(game.state, '-Kkxf1ukVSF9VV6mIPlG'), //Freddy
        playerCharacter: new Character(game.state, '55e38d23d842e50e9026'), //Test wizard
        requestZone: new Zone(game.state, 'C4Z7F8XMW'), //arena
        currentMatch: {}, //new Match(game.state, 'testingMatch'),
        game,
        slackCallback: 'command:action/selectActionMenu:shop:-KkJVqtBIhpAKBfz9tcb/shopMainMenu:purchaseButton:purchaseButton/shopPurchaseMenu:itemList:-sfdsfsfd/itemDetailMenu',
        //TODO the below action ID is not for forken lightning because I have not set it up yet
        actionTaken: {}, //new Action(game.state, '-Kjpe29q_fDkJG-73AQO'),
        payload: mockRequest
    };

    let backButtonResponse = processBackButton(gameObjects);

    console.log('DEBUG backButtonResponse: ', backButtonResponse);
});

*/
