"use strict";

const assert = require('assert');
const formatSlackRequest = require('../../../../app/middleware/formatSlackRequest');


describe("Testing formatSlackRequest.modifyCallbackForBack", function() {

    let testCallback = 'command:profile/characterProfileMenu:inventory:inventory/selectInventoryMenu:inventorySelection:-KjGQ1IPuwE24t4LPPNd/';

    describe("with parameter: damageOverTime", function(){
        let formattedResponse = formatSlackRequest.modifyCallbackForBack(testCallback);

        console.log('DEBUG test response: ', formattedResponse)

        /*
        it("should return a function", function(){
            assert(typeof(formattedResponse) === 'function');
        })*/
    });
});

