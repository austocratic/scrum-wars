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




    })


});
