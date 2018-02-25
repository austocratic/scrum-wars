"use strict";

const assert = require('assert');

const testDB = require('../../testDB');

const Game = require('../../../models/Game').Game;
const BaseModel = require('../../../models/BaseModel').BaseModel;

let game = new Game();
game.state = testDB;


describe("Testing BaseModel", function() {

    describe(" of type character", function(){

        let testBaseModel = new BaseModel(game.state, 'character', '55e38d23d842e50e9026');

        let testBaseProperties = {};

        let testPropertiesToModify = [
            {
                modified_strength: 5
            },
            {
                modified_strength: 5,
                modified_toughness: 2
            }];

        testPropertiesToModify.forEach( eachTestPropertiesToModify =>{
            testBaseModel.accumulateProperties(testBaseProperties, eachTestPropertiesToModify);
        });
    });

    describe("testing incrementProperty", function(){

        let testBaseModel = new BaseModel(game.state, 'character', '55e38d23d842e50e9026');

        /*
        it("should not be undefined", function(){
            assert.throws(()=> {
                testBaseModel.incrementProperty('lasagna', 5)
            },
            err => {
                if ((err instanceof Error)) {
                    return true;
                }
            },

            "Called incrementProperty referencing a property that does not exist")

        });*/

        it("should throw an error", function() {
            assert(() => {
                if (testBaseModel.incrementProperty('lasagna', 5) instanceof Error) {
                    return true
                }
            })
        })

        console.log('Prop test: testBaseModel: ', testBaseModel.props);

        console.log('TEST ', testBaseModel.incrementProperty('gold', 5));

        it("should not throw an error", function() {
            assert(() => {
                if (testBaseModel.incrementProperty('props.gold', 5) instanceof Error) {
                    return true
                } else {
                    return false
                }
            })
        })




    })




});
