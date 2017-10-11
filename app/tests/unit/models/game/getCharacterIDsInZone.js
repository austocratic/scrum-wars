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


describe("Testing game.getCharacterIDsInZone", function() {

    //In the arena
    let charsInZone = game.getCharacterIDsInZone('-Khu9Ti4cn9PQ2Q1TSBT');

    console.log('DEBUG getCharacterIDsInZone: ', charsInZone);

});
