"use strict";

const assert = require('assert');
const DamageOverTime = require('../../../../../../app/controllers/actionEffectControllers/actionEffects/DamageOverTime').DamageOverTime;
const Character = require('../../../../../../app/models/Character').Character;
const Game = require('../../../../../../app/models/Game').Game;
const Zone = require('../../../../../../app/models/Zone').Zone;
const testDB = require('../../../../testDB');

let game = new Game();
game.state = testDB;


describe("Testing DamageOverTime class", function() {

    describe("testing instantiating it", function () {

        let gameObjects = {
            targetCharacter: new Character(game.state, '-Kkxf1ukVSF9VV6mIPlG'), //Freddy
            playerCharacter: new Character(game.state, '55e38d23d842e50e9026'), //Test wizard
            requestZone: new Zone(game.state, 'C4Z7F8XMW'), //arena
            game: {
                baseURL: game.baseURL,
                avatarPath: game.avatarPath
            }
        };

        let testDamageOverTime = new DamageOverTime(gameObjects);

        it("should not be undefined", function () {

            assert(testDamageOverTime);

        });

        describe("calling initiate()", function () {

            let targetCharacterPreviousHealth = gameObjects.targetCharacter.props.hit_points;

            testDamageOverTime.initiate();

            it("should reduce targetCharacter's health by DamageOverTime's calculatedDamage property", function () {

                assert(gameObjects.targetCharacter.props.hit_points + testDamageOverTime.calculatedDamage === targetCharacterPreviousHealth);

            });
        })
    });
});