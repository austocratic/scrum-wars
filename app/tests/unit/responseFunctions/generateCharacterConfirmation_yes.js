"use strict";

const assert = require('assert');

const yes = require('../../../controllers/gameContexts/generateCharacterConfirmation').yes;

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

const gameContext = 'generateCharacterConfirmation';
const userSelection = 'yes';

describe("Testing gameContext " + gameContext + " & user selection " +  userSelection, function() {

    let slackResponseTemplate = {};

    let testOriginalCharacterID = 'a7ad15dd1052e7e7ef8a';

    let playerCharacter = {
        "actions": [{
            "action_id": "-Kjpe29q_fDkJG-73AQO",
            "is_available": 1,
            "turn_available": 0,
            "turn_used": 0
        }, {
            "action_id": "-KjpeJT7Oct3ZCtLhENO",
            "is_available": 1,
            "turn_available": 0,
            "turn_used": 0
        }, {
            "action_id": "-KkdduB9XuB46EsxqwIX",
            "is_available": 1,
            "turn_available": 0,
            "turn_used": 0
        }, {
            "action_id": "-KkJVqtBIhpAKBfz9tcb",
            "is_available": 1,
            "turn_available": 0,
            "turn_used": 0
        }, {
            "action_id": "-KqtOcn7MapqMfnGIZvo",
            "is_available": 1,
            "turn_available": 0,
            "turn_used": 0
        }, {
            "action_id": "-KrJaBvyYDGrNVfcaAd0",
            "is_available": 1,
            "turn_available": 0,
            "turn_used": 0
        }],
        "active": 1,
        "armor": 0,
        "avatar": "app/assets/fullSize/character_avatar/female/f_08.png",
        "class_id": "-KircnK2x1_31EQiAYlk",
        "dexterity": 12,
        "gender": "female",
        "gold": 80,
        "hit_points": 100,
        "intelligence": 18,
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
        "modified_dexterity": 14,
        "modified_intelligence": 18,
        "modified_strength": 11,
        "modified_toughness": 6,
        "name": "Sindria",
        "strength": 4,
        "toughness": 6,
        "user_id": "-Kp1Y_uOmv_EwNc8mTj4",
        "zone_id": "-Khu9Zazk5XdFX9fD2Y8"
    };

    let user = new User(game.state, 'U4ZA6CCBG');

    let slackResponseTemplateReturned = yes({
        game,
        slackResponseTemplate,
        //slackCallback,
        user,
        playerCharacter
    });

    testSlackResponseFormat(slackResponseTemplateReturned);

    it("should update user ID " + user.id + "'s character_id, so user's character should not equal " + testOriginalCharacterID, function () {
        assert.notEqual(user.props.character_id, testOriginalCharacterID);
    });

});

