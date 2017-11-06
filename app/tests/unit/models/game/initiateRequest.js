"use strict";

const assert = require('assert');

const testDB = require('../../../testDB');

let Game = require('../../../../models/Game').Game;
let Character = require('../../../../models/Character').Character;
let User = require('../../../../models/User').User;
let Zone = require('../../../../models/Zone').Zone;
let Match = require('../../../../models/Match').Match;
let Class = require('../../../../models/Class').Class;

let game = new Game();
game.state = testDB;

describe("Testing game.initiateRequest ", function() {

    let slackResponseTemplate = {};

    console.log('DEBUG game.state.character[55e38d23d842e50e9026]: ', game.state.character['55e38d23d842e50e9026'].stats_current);

    game.initiateRequest();

    //testSlackResponseFormat(slackResponseTemplateReturned);

});

