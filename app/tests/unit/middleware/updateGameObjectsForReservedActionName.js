"use strict";

const assert = require('assert');
const updateGameObjectsForReservedActionName = require('../../../../app/middleware/updateGameObjectsForReservedActionName').updateGameObjectsForReservedActionName;

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

describe("Testing updateGameObjectsForReservedActionName() Middleware", function(){

    describe("with a long callback", function(){

        let gameObjectsLong = {
            userActionNameSelection: 'back',
            userActionValueSelection: 'stuff',
            command: '',
            slackCallback: 'command:profile/characterProfileMenu:inventory:inventory/selectInventoryMenu:inventorySelection:-KjGQ1IPuwE24t4LPPNd/itemDetailMenu',
        };

        updateGameObjectsForReservedActionName(gameObjectsLong);

        it("should modify the callback", function(){
            assert.equal(gameObjectsLong.slackCallback, 'command:profile/characterProfileMenu')
        });
        it("should modify the gameContext", function(){
            assert.equal(gameObjectsLong.gameContext, 'characterProfileMenu')
        });
        it("should modify the userActionNameSelection", function(){
            assert.equal(gameObjectsLong.userActionNameSelection, 'inventory')
        });
        it("should modify the userActionValueSelection", function(){
            assert.equal(gameObjectsLong.userActionValueSelection, 'inventory')
        });
    });

    /*
     describe("with a callback from characterClassDetail", function(){

     let gameObjectsLong = {
     userActionNameSelection: 'back',
     userActionValueSelection: 'stuff',
     command: '',
     slackCallback: "command:action/generateCharacterConfirmation:yes:yes/selectCharacterClassMenu:classDetailMenu:-Kird8_Vef-8Ej2aShaO/selectGenderMenu"
     };

     updateGameObjectsForReservedActionName(gameObjectsLong);

     it("should modify the callback", function(){
     assert.equal(gameObjectsLong.slackCallback, 'command:profile/characterProfileMenu')
     });
     it("should modify the gameContext", function(){
     assert.equal(gameObjectsLong.gameContext, 'characterProfileMenu')
     });
     it("should modify the userActionNameSelection", function(){
     assert.equal(gameObjectsLong.userActionNameSelection, 'inventory')
     });
     it("should modify the userActionValueSelection", function(){
     assert.equal(gameObjectsLong.userActionValueSelection, 'inventory')
     });
     });*/

    describe("with a short callback", function(){

        let gameObjectsShort = {
            type: 'interactive_message',
            userActionNameSelection: 'back',
            userActionValueSelection: '',
            command: '',
            slackCallback: 'command:profile/characterProfileMenu:equipment:equipment/selectEquipmentMenu',
        };

        updateGameObjectsForReservedActionName(gameObjectsShort);

        it("should modify the command", function(){
            assert.equal(gameObjectsShort.gameContext, 'command')
        });
        it("should modify the userActionNameSelection", function(){
            assert.equal(gameObjectsShort.userActionNameSelection, 'profile')
        });
        //it("should modify the slackCallback", function(){
        //    assert.equal(gameObjectsShort.slackCallback, 'profile')
        //});

    });
});