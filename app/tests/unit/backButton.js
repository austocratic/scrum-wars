"use strict";

const assert = require('assert');
const backButton = require('../../controllers/backButton').backButton;


describe("Testing back button functionality", function() {

    describe("where the callback string is 4 game contexts long", function(){
        const slackCallback = 'command:action/selectActionMenu:shop/selectShopItemMenu:-KjGQEzVbaxRlWFawSqI/purchaseItemConfirmation';

        let updatedSlackCallback = backButton(slackCallback);

        it("should equal command:action/selectActionMenu:shop/selectShopItemMenu", function(){
            assert.equal(updatedSlackCallback, 'command:action/selectActionMenu:shop/selectShopItemMenu')
        })
    });

    describe("where the callback string is 2 game contexts long", function(){
        const slackCallback = 'command:action/selectActionMenu';

        let updatedSlackCallback = backButton(slackCallback);

        it("should equal command", function(){
            assert.equal(updatedSlackCallback, 'command')
        });
    });
});

