"use strict";

const chai = require('chai');
const assert = require('assert');
const expect = chai.expect;

let validateSlackResponseFormat = require('../../../helpers').validateSlackResponseFormat;


/*TODO
describe.skip("Testing helper function validateSlackResponseFormat", function(){
    
    let validResponseFormat ={
        
    };
    
    it("should succeed because function call response is not an error", function(){
        //assert(validateSlackResponseFormat(validResponseFormat))

        //expect([1, 2]).to.be.an('array');

        let response = validateSlackResponseFormat(validResponseFormat);

        console.log('response: ', response);

        //expect(validateSlackResponseFormat(validResponseFormat)).to.not.throw()
    })
    
    describe("with invalid test data", function(){

        let thisTestInput;

        thisTestInput = undefined;

        function thisTest(){
            return validateSlackResponseFormat(thisTestInput);
        }

        describe("undefined value", function(){


            assert.throws(validateSlackResponseFormat(thisTestInput) );

            it("should throw an error", function(done){

                //expect(thisTest).to.throw()

            })
        })


        
        
    })
});*/
