"use strict";

const assert = require('assert');
const modifyCallbackForBack = require('../../controllers/backButton').modifyCallbackForBack;
const modifyUserActionNameSelection = require('../../controllers/backButton').modifyUserActionNameSelection;


describe("Testing back button functionality", function() {

    /*
    describe("where the callback string is 4 game contexts long", function(){
        const slackCallback = 'command:action/selectActionMenu:shop/selectShopItemMenu:-KjGQEzVbaxRlWFawSqI/purchaseItemConfirmation';

        let updatedSlackCallback = modifyCallbackForBack(slackCallback);

        it("should equal command:action/selectActionMenu:shop/selectShopItemMenu", function(){
            assert.equal(updatedSlackCallback, 'command:action/selectActionMenu')
        })
    });*/

    describe("where the callback string is 3 game contexts long", function(){
        const slackCallback = 'command:profile/characterProfileMenu:equipment/selectEquipmentMenu';

        let updatedSlackCallback = modifyCallbackForBack(slackCallback);

        console.log('updatedSlackCallback = ', updatedSlackCallback);

        it("should equal command", function(){
            assert.equal(updatedSlackCallback, 'command')
        });
    });

    /*
    describe("where the callback string is 2 game contexts long", function(){
        const slackCallback = 'command:action/selectActionMenu';

        let updatedSlackCallback = modifyCallbackForBack(slackCallback);

        it("should equal command", function(){
            assert.equal(updatedSlackCallback, 'command')
        });
    });*/
});

describe("Testing back button functionality", function() {

    /*
    describe("where the prior value selected was shop", function(){
        const slackCallback = 'command:action/selectActionMenu:shop/selectShopItemMenu:-KjGQEzVbaxRlWFawSqI/purchaseItemConfirmation';

        let updatedActionName = modifyUserActionNameSelection(slackCallback);

        it("should equal shop", function(){
            assert.equal(updatedActionName, 'shop')
        })
    });*/
    
    describe("where the prior value selected was equipment", function(){
        const slackCallback = 'command:profile/characterProfileMenu:equipment/selectEquipmentMenu';

        let updatedActionName = modifyUserActionNameSelection(slackCallback);
        
        console.log('updatedActionName = ', updatedActionName);

        it("should equal shop", function(){
            assert.equal(updatedActionName, 'profile')
        })
    });
});


