"use strict";

const assert = require('assert');
const formatSlackRequest = require('../../../../app/middleware/formatSlackRequest');

/*
describe("Testing formatSlackRequest.modifyCallbackForBack", function() {

    //Example of back working correctly
    //command:profile/characterProfileMenu:equipment:equipment/selectEquipmentMenu:equipmentSelection:-KjGQPbo-96j_Uikhjqh/itemDetailMenu"
    //command:profile/characterProfileMenu:equipment:no/selectEquipmentMenu"

    let testCallback = 'command:profile/characterProfileMenu:inventory:inventory/selectInventoryMenu:inventorySelection:-KjGQ1IPuwE24t4LPPNd/itemDetailMenu';
    describe("with a back selection on a context at least 4 contexts deep", function(){
        let formattedResponse = formatSlackRequest.modifyCallbackForBack(testCallback);

        it("should shorten the callback", function(){
            assert.equal(formattedResponse, 'command:profile/characterProfileMenu')
        })
    });

    let shortCallback = 'command:profile/characterProfileMenu:equipment:equipment/selectEquipmentMenu';

    describe("with a back selection on a context less than 4 contexts deep", function(){
        let formattedResponse = formatSlackRequest.modifyCallbackForBack(shortCallback);

        it("should shorten the callback", function(){
            assert.equal(formattedResponse, 'command')
        })
    });*/

    /*
    let testRequest = {"payload": {"actions":[
        {"name":"back","type":"button","value":"back"}],
        "callback_id":"command:profile/characterProfileMenu:equipment:equipment/selectEquipmentMenu",
        "team":{"id":"T4ZAGTM1V","domain":"austo"},
        "channel":{"id":"C4Z4P1BUH","name":"town"},
        "user":{"id":"U4ZA6CCBG","name":"austo"},
        "action_ts":"1494119116.939879","message_ts":"1494119112.000009",
        "attachment_id":"1","token":"a6qLRgANE3lHNDP50zb0vmoJ",
        "is_app_unfurl":false,
        "response_url":"https://hooks.slack.com/actionControllers/T4ZAGTM1V/180613324358/NksqMUdQqN8HIDQhETh5dsWf"}};

    describe("with parameter: damageOverTime", function(){
        formatSlackRequest.modifyPayloadForReservedActions(testRequest);

        console.log('DEBUG test response: ', JSON.stringify(testRequest));
    });*/


//});

