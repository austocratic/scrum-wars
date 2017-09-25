'use strict';

var assert = require('assert');


const testSlackResponseFormat = (responseToTest) => {

    describe("testing the format of the value to ensure that it is formatted for Slack, value testing: " + JSON.stringify(responseToTest), function () {
        it("should return a value (should not be undefined) ", function () {
            assert(responseToTest);
            
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
                                    describe("the attachment has .actionControllers property, testing actionControllers specific format", function () {
                                        it("action should be an array", function () {
                                            assert(Array.isArray(eachAttachment.actions));
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
    });
};


module.exports = {
    testSlackResponseFormat
};
