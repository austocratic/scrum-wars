"use strict";

const assert = require('assert');
const ForkedLightning = require('../../../../../../app/controllers/actionControllers/actions/ForkedLightning').ForkedLightning;
const Character = require('../../../../../../app/models/Character').Character;
const Game = require('../../../../../../app/models/Game').Game;
const Action = require('../../../../../../app/models/Action').Action;
const Match = require('../../../../../../app/models/Match').Match;
const Zone = require('../../../../../../app/models/Zone').Zone;
const testDB = require('../../../../testDB');

let game = new Game();
game.state = testDB;


describe("Testing ForkedLightning class", function() {

    describe("testing instantiating it", function () {

        let gameObjects = {
            slackResponseTemplate: {},
            targetCharacter: new Character(game.state, '-Kkxf1ukVSF9VV6mIPlG'), //Freddy
            playerCharacter: new Character(game.state, '55e38d23d842e50e9026'), //Test wizard
            requestZone: new Zone(game.state, 'C4Z7F8XMW'), //arena
            currentMatch: new Match(game.state, '-KmTOFWVJav3v7j1hYLA'),
            game,
            slackCallback: 'command:action/selectActionMenu:-Kjpe29q_fDkJG-73AQO/selectActionTarget',
            //TODO the below action ID is not for forken lightning because I have not set it up yet
            actionTaken: new Action(game.state, '-Kjpe29q_fDkJG-73AQO')
        };

        let testForkedLightning = new ForkedLightning(gameObjects);

        it("should not be undefined", function () {

            assert(testForkedLightning);

        });

        describe("calling initiate()", function () {

            let targetCharacterPreviousHealth = gameObjects.targetCharacter.props.hit_points;

            testForkedLightning.initiate();
            
            /* It wont necessarily reduce the targets health (it could miss)
            it("should reduce targetCharacter's health by ForkedLightning's calculatedDamage property", function () {
                assert(gameObjects.targetCharacter.props.hit_points + testForkedLightning.calculatedDamage === targetCharacterPreviousHealth);
            });*/
        })
    });
});