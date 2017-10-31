"use strict";

const assert = require('assert');
const Whirlwind = require('../../../../../../app/controllers/actionControllers/actions/Whirlwind').Whirlwind;
const Character = require('../../../../../../app/models/Character').Character;
const Game = require('../../../../../../app/models/Game').Game;
const Action = require('../../../../../../app/models/Action').Action;
const Match = require('../../../../../../app/models/Match').Match;
const Zone = require('../../../../../../app/models/Zone').Zone;
const testDB = require('../../../../testDB');

let game = new Game();
game.state = testDB;


describe("Testing Whirlwind class", function() {

    describe("testing instantiating it", function () {

        //Add a match for this test
        game.state.match['testingMatch'] = {
            "character_id_won" : 0,
            "date_ended" : 0,
            "date_started" : 0,
            "number_turns" : 1,
            "starting_character_ids" : [
                '-Kkxf1ukVSF9VV6mIPlG',
                '55e38d23d842e50e9026',
                '5bdfe1adfef85f3af257'
            ],
            "zone_id" : '-Khu9Ti4cn9PQ2Q1TSBT'
        };

        let gameObjects = {
            slackResponseTemplate: {},
            targetCharacter: new Character(game.state, '-Kkxf1ukVSF9VV6mIPlG'), //Freddy
            playerCharacter: new Character(game.state, '55e38d23d842e50e9026'), //Test wizard
            requestZone: new Zone(game.state, 'C4Z7F8XMW'), //arena
            currentMatch: new Match(game.state, 'testingMatch'),
            game,
            slackCallback: 'command:action/selectActionMenu:-Kjpe29q_fDkJG-73AQO/selectActionTarget',
            //TODO the below action ID is not for forken lightning because I have not set it up yet
            actionTaken: new Action(game.state, '-Kjpe29q_fDkJG-73AQO')
        };

        let testWhirlwind = new Whirlwind(gameObjects);

        it("should not be undefined", function () {

            assert(testWhirlwind);

        });

        describe("calling initiate()", function () {

            let targetCharacterPreviousHealth = gameObjects.targetCharacter.props.hit_points;

            testWhirlwind.initiate();

            /* It wont necessarily reduce the targets health (it could miss)
            it("should reduce targetCharacter's health by ForkedLightning's calculatedDamage property", function () {
                assert(gameObjects.targetCharacter.props.hit_points + testForkedLightning.calculatedDamage === targetCharacterPreviousHealth);
            });*/
        })
    });
});