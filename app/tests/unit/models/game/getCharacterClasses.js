"use strict";

const assert = require('assert');

const testSlackResponseFormat = require('../../../testSlackResponseFormat').testSlackResponseFormat;

const testDB = require('../../../testDB');

let Game = require('../../../../models/Game').Game;
let Character = require('../../../../models/Character').Character;
let User = require('../../../../models/User').User;
let Zone = require('../../../../models/Zone').Zone;
let Match = require('../../../../models/Match').Match;
let Class = require('../../../../models/Class').Class;

let game = new Game();
game.state = testDB;


describe("Testing game.getCharacterClasses", function() {

    //In the arena
    let availableClasses = game.getCharacterClasses();

    console.log('DEBUG availableClasses: ', availableClasses);

    it("should not be undefined", function(){
        assert(availableClasses)
    })

});
