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

    game.initiateRequest();

    //testSlackResponseFormat(slackResponseTemplateReturned);

});

