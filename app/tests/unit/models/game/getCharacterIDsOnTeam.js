"use strict";

const assert = require('assert');

const testSlackResponseFormat = require('../../../testSlackResponseFormat').testSlackResponseFormat;

const testDB = require('../../../testDB');

let Game = require('../../../../models/Game').Game;

let game = new Game();
game.state = testDB;

describe("Testing game.getCharacterIDsOnTeam", function() {

    //console.log('DEBUG characters')

    /*
    //In the arena
    let availableClasses = game.getCharacterIDsOnTeam();

    console.log('DEBUG availableClasses: ', availableClasses);

    it("should not be undefined", function(){
        assert(availableClasses)
    })*/

});
