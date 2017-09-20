"use strict";

const assert = require('assert');

const classSelection = require('../../../controllers/gameContexts/selectCharacterClassMenu').classSelection;

const testSlackResponseFormat = require('../../testSlackResponseFormat').testSlackResponseFormat;

const testDB = require('../../testDB');

let Game = require('../../../models/Game').Game;
let Character = require('../../../models/Character').Character;
let User = require('../../../models/User').User;
let Zone = require('../../../models/Zone').Zone;
let Match = require('../../../models/Match').Match;
let Class = require('../../../models/Class').Class;

let game = new Game();
game.state = testDB;

const gameContext = 'selectCharacterClassMenu';

//Shadow Knight
const userActionValueSelection = '-KircSgAkPTavnfob8F5';

describe("Testing gameContext " + gameContext + " & user selection " +  userActionValueSelection, function() {

    let slackResponseTemplate = {};

    //TODO should not use DB data here (even though it is test data it could still change)
    let characterClass = new Class(game.state, userActionValueSelection);

    let playerCharacter = {
        "id": "4i2432o4i24o",
        "props": {
            "active": 1,
            "armor": 0,
            "avatar": "app/assets/fullSize/character_avatar/female/f_08.png",
            "gender": "female",
            "gold": 80,
            "hit_points": 100,
            "inventory": [{
                "equipment_slot_id": ["-KmTV24FelP7T8rdKLEx"],
                "equipment_slots": ["-KmTV24FelP7T8rdKLEx"],
                "is_equipped": 1,
                "item_id": "-KjGQ1IPuwE24t4LPPNd",
                "modifiers": {
                    "modified_strength": 5
                },
                "name": "rusty longsword"
            }, {
                "equipment_slot_id": ["-KmTV24FelP7T8rdKLEx"],
                "equipment_slots": ["-KmTV24FelP7T8rdKLEx"],
                "is_equipped": 1,
                "item_id": "-KjGQPbo-96j_Uikhjqh",
                "modifiers": {
                    "modified_dexterity": 2,
                    "modified_strength": 2
                },
                "name": "rusty dagger"
            }],
            "is_hidden": 0,
            "level": 1,
            "match_wins": 0,
            "max_hit_points": 100,
            "name": "Sindria",
            "user_id": "-Kp1Y_uOmv_EwNc8mTj4",
            "zone_id": "-Khu9Zazk5XdFX9fD2Y8"
        }
    };

    console.log('DEBUG selectCharacterClassMenu, characterClass.id: ', characterClass.id);

    let slackResponseTemplateReturned = classSelection({
        slackResponseTemplate,
        characterClass,
        playerCharacter
    });

    testSlackResponseFormat(slackResponseTemplateReturned);
});

