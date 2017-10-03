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

const gameContext = 'genderSelection';
const userSelection = 'female';

describe("Testing gameContext " + gameContext + " & user selection " +  userSelection, function() {

    /* Broken test - to revise
    let slackResponseTemplate = {};

    //Mock a character that does not have gender property set yet
    let testCharacterID = '55e38d23d842e50e9026';

    let playerCharacter = new Character(game.state, testCharacterID);

    let slackResponseTemplateReturned = game.getEquippedItemView(playerCharacter);

    //testSlackResponseFormat(slackResponseTemplateReturned);
*/
});

