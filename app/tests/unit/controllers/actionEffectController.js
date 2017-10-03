"use strict";

const assert = require('assert');
const getActionEffectController = require('../../../../app/controllers/actionEffectController').getActionEffectController;


describe("Testing getActionEffectController", function() {

    describe("with parameter: damageOverTime", function(){
        let actionEffectResponse = getActionEffectController('damageOverTime');

        it("should return a function", function(){

            assert(typeof(actionEffectResponse) === 'function');

        })
    });

    describe("with parameter: lasagna", function(){

        it("should throw an error", function(){
            assert.throws(
                () => {
                    let actionEffectResponse = getActionEffectController('lasagna');
                },
                Error,
                'getActionEffectController correctly threw an error'
            );
        })
    })



});

