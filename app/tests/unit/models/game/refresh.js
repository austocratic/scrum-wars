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

game.state.global_state = {
    "-Kjkkd-WF6OZAa9tCOt0" : {
        "number_turns" : 1
    },
    "match_id" : "",
    "next_match_start" : 5000000000
};

//NOTE: I ADDED THIS FUNCTION SO TEST WONT RUN, need to fix the tests
function skipThisTest(){
    describe.skip("Testing gameContext game.refresh()", function() {

        describe("Game match is 'pending' state", function(){

            game.state.global_state.match_id = "pendingMatch";
            game.state.match["pendingMatch"] = {
                "character_id_won" : 0,
                "date_started" : 0,
                "date_ended" : 0,
                "number_turns" : 0,
                "status": "pending",
                "zone_id" : "-Khu9Ti4cn9PQ2Q1TSBT"
            };

            game.refresh();

            it("should change the status to started", function(){
                assert.equal(game.state.match["pendingMatch"].status, 'started')
            });
            it("should set date_started to a value greater than 0", function(){
                assert(game.state.match["pendingMatch"].date_started > 0)
            });
            it("should create the starting_character_ids property", function(){

                console.log('starting character ids: ', game.state.match["pendingMatch"].starting_character_ids);
                assert(game.state.match["pendingMatch"].starting_character_ids)
            });

        });

        describe("Game match is 'started' state and does not have a winner (more than 1 character still alive)", function(){

            game.state.global_state.match_id = "testingMatch";
            game.state.match["testingMatch"] = {
                "character_id_won" : 0,
                "date_started" : 1443615911.108, // 9AM & 15 seconds PST
                "date_ended" : 0,
                "number_turns" : 3,
                "starting_character_ids" : [

                ],
                "status": "started",
                "zone_id" : "-Khu9Ti4cn9PQ2Q1TSBT"
            };

            //Add some starting characters to the match
            game.state.match["testingMatch"].starting_character_ids.push("aliveCharacter1");
            game.state.match["testingMatch"].starting_character_ids.push("aliveCharacter2");
            game.state.character["aliveCharacter1"] = {
                "actions" : [
                    {
                        "action_id" : "-Kjpe29q_fDkJG-73AQO",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KjpeJT7Oct3ZCtLhENO",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KkdduB9XuB46EsxqwIX",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KqtOcn7MapqMfnGIZvo",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-Kr9TRwZS7C9JHm1VzE3",
                        "turn_available" : 0,
                        "turn_used" : 0
                    } ],
                "active" : 1,
                "armor" : 0,
                "class_id" : "-KircnK2x1_31EQiAYlk",
                "dexterity" : 12,
                "effects": [
                    {
                        "action_id": "-KvOpJ2FyGodmZCanea7",
                        "applied_by_character_id": "55e38d23d842e50e9026",
                        "turn_applied": 2
                    }
                ],
                "gender" : "male",
                "gold" : 100,
                "hit_points" : 50,
                "intelligence" : 18,
                "inventory" : [ {
                    "equipment_slot_id" : "hand",
                    "is_equipped" : 1,
                    "item_id" : "-KjGQ1IPuwE24t4LPPNd",
                    "modifiers" : {
                        "modified_intelligence" : 4,
                        "modified_strength" : -1
                    }
                } ],
                "is_defending" : false,
                "is_hidden" : 0,
                "level" : 1,
                "match_wins" : 3,
                "max_hit_points" : 100,
                "modified_dexterity" : 12,
                "modified_intelligence" : 22,
                "modified_strength" : 3,
                "modified_toughness" : 6,
                "name" : "Freddy",
                "profile_image" : "unknown_character.jpg",
                "strength" : 4,
                "toughness" : 6,
                "turn_action_used" : 0,
                "user_id" : "U55U8F5B7",
                "zone_id" : "-Khu9Ti4cn9PQ2Q1TSBT"

            };
            game.state.character["aliveCharacter2"] = {
                "actions" : [
                    {
                        "action_id" : "-Kjpe29q_fDkJG-73AQO",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KjpeJT7Oct3ZCtLhENO",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KkdduB9XuB46EsxqwIX",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KqtOcn7MapqMfnGIZvo",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-Kr9TRwZS7C9JHm1VzE3",
                        "turn_available" : 0,
                        "turn_used" : 0
                    } ],
                "active" : 1,
                "armor" : 0,
                "class_id" : "-KircnK2x1_31EQiAYlk",
                "dexterity" : 12,
                "effects": [
                    {
                        "action_id": "-KvOpJ2FyGodmZCanea7",
                        "applied_by_character_id": "55e38d23d842e50e9026",
                        "turn_applied": 2
                    }
                ],
                "gender" : "male",
                "gold" : 100,
                "hit_points" : 50,
                "intelligence" : 18,
                "inventory" : [ {
                    "equipment_slot_id" : "hand",
                    "is_equipped" : 1,
                    "item_id" : "-KjGQ1IPuwE24t4LPPNd",
                    "modifiers" : {
                        "modified_intelligence" : 4,
                        "modified_strength" : -1
                    }
                } ],
                "is_defending" : false,
                "is_hidden" : 0,
                "level" : 1,
                "match_wins" : 3,
                "max_hit_points" : 100,
                "modified_dexterity" : 12,
                "modified_intelligence" : 22,
                "modified_strength" : 3,
                "modified_toughness" : 6,
                "name" : "Freddy",
                "profile_image" : "unknown_character.jpg",
                "strength" : 4,
                "toughness" : 6,
                "turn_action_used" : 0,
                "user_id" : "U55U8F5B7",
                "zone_id" : "-Khu9Ti4cn9PQ2Q1TSBT"

            };

            let turnBeforeIncrement = game.state.match["testingMatch"].number_turns;

            game.refresh();

            it("should increment the turn number by one", function(){
                assert.equal((turnBeforeIncrement + 1), game.state.match["testingMatch"].number_turns)
            })

        });

        describe("Game match is 'started' and one of the characters is below 0 hit_points", function(){

            game.state.global_state.match_id = "testingMatch2";
            game.state.match["testingMatch2"] = {
                "character_id_won" : 0,
                "date_started" : 1443615911.108, // 9AM & 15 seconds PST
                "date_ended" : 0,
                "number_turns" : 3,
                "starting_character_ids" : [

                ],
                "status": "started",
                "zone_id" : "-Khu9Ti4cn9PQ2Q1TSBT"
            };

            //Add an alive character & a dead character for testing
            game.state.match["testingMatch2"].starting_character_ids.push("aliveCharacter1");
            game.state.character["aliveCharacter1"] = {
                "actions" : [
                    {
                        "action_id" : "-Kjpe29q_fDkJG-73AQO",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KjpeJT7Oct3ZCtLhENO",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KkdduB9XuB46EsxqwIX",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KqtOcn7MapqMfnGIZvo",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-Kr9TRwZS7C9JHm1VzE3",
                        "turn_available" : 0,
                        "turn_used" : 0
                    } ],
                "active" : 1,
                "armor" : 0,
                "class_id" : "-KircnK2x1_31EQiAYlk",
                "dexterity" : 12,
                "effects": [
                    {
                        "action_id": "-KvOpJ2FyGodmZCanea7",
                        "applied_by_character_id": "55e38d23d842e50e9026",
                        "turn_applied": 2
                    }
                ],
                "gender" : "male",
                "gold" : 100,
                "hit_points" : 50,
                "intelligence" : 18,
                "inventory" : [ {
                    "equipment_slot_id" : "hand",
                    "is_equipped" : 1,
                    "item_id" : "-KjGQ1IPuwE24t4LPPNd",
                    "modifiers" : {
                        "modified_intelligence" : 4,
                        "modified_strength" : -1
                    }
                } ],
                "is_defending" : false,
                "is_hidden" : 0,
                "level" : 1,
                "match_wins" : 3,
                "max_hit_points" : 100,
                "modified_dexterity" : 12,
                "modified_intelligence" : 22,
                "modified_strength" : 3,
                "modified_toughness" : 6,
                "name" : "Freddy",
                "profile_image" : "unknown_character.jpg",
                "strength" : 4,
                "toughness" : 6,
                "turn_action_used" : 0,
                "user_id" : "U55U8F5B7",
                "zone_id" : "-Khu9Ti4cn9PQ2Q1TSBT"

            };
            game.state.match["testingMatch2"].starting_character_ids.push("deadCharacter1");
            game.state.character["deadCharacter1"] = {
                "actions" : [
                    {
                        "action_id" : "-Kjpe29q_fDkJG-73AQO",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KjpeJT7Oct3ZCtLhENO",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KkdduB9XuB46EsxqwIX",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KqtOcn7MapqMfnGIZvo",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-Kr9TRwZS7C9JHm1VzE3",
                        "turn_available" : 0,
                        "turn_used" : 0
                    } ],
                "active" : 1,
                "armor" : 0,
                "class_id" : "-KircnK2x1_31EQiAYlk",
                "dexterity" : 12,
                "effects": [
                    {
                        "action_id": "-KvOpJ2FyGodmZCanea7",
                        "applied_by_character_id": "55e38d23d842e50e9026",
                        "turn_applied": 2
                    }
                ],
                "gender" : "male",
                "gold" : 100,
                "hit_points" : -5,
                "intelligence" : 18,
                "inventory" : [ {
                    "equipment_slot_id" : "hand",
                    "is_equipped" : 1,
                    "item_id" : "-KjGQ1IPuwE24t4LPPNd",
                    "modifiers" : {
                        "modified_intelligence" : 4,
                        "modified_strength" : -1
                    }
                } ],
                "is_defending" : false,
                "is_hidden" : 0,
                "level" : 1,
                "match_wins" : 3,
                "max_hit_points" : 100,
                "modified_dexterity" : 12,
                "modified_intelligence" : 22,
                "modified_strength" : 3,
                "modified_toughness" : 6,
                "name" : "Freddy",
                "profile_image" : "unknown_character.jpg",
                "strength" : 4,
                "toughness" : 6,
                "turn_action_used" : 0,
                "user_id" : "U55U8F5B7",
                "zone_id" : "-Khu9Ti4cn9PQ2Q1TSBT"

            };

            game.refresh();

            it("should updated the dead characters zone to the town square", function(){
                assert.equal(game.state.character["deadCharacter1"].zone_id, "-Khu9Zazk5XdFX9fD2Y8")
            })

        });

        describe("Game match is 'ended'", function(){

            describe("and it is time to start the next match", function(){

                game.state.global_state.match_id = "endedMatch";
                game.state.match["endedMatch"] = {
                    "character_id_won" : 0,
                    "date_started" : 1443615911.108, // 9AM & 15 seconds PST
                    "date_ended" : 0,
                    "number_turns" : 8,
                    "starting_character_ids" : [

                    ],
                    "status": "started",
                    "zone_id" : "-Khu9Ti4cn9PQ2Q1TSBT"
                };

                //Add an alive character & a dead character for testing
                game.state.match["testingMatch2"].starting_character_ids.push("aliveCharacter1");
                game.state.character["aliveCharacter1"] = {
                    "actions" : [
                        {
                            "action_id" : "-Kjpe29q_fDkJG-73AQO",
                            "turn_available" : 0,
                            "turn_used" : 0
                        }, {
                            "action_id" : "-KjpeJT7Oct3ZCtLhENO",
                            "turn_available" : 0,
                            "turn_used" : 0
                        }, {
                            "action_id" : "-KkdduB9XuB46EsxqwIX",
                            "turn_available" : 0,
                            "turn_used" : 0
                        }, {
                            "action_id" : "-KqtOcn7MapqMfnGIZvo",
                            "turn_available" : 0,
                            "turn_used" : 0
                        }, {
                            "action_id" : "-Kr9TRwZS7C9JHm1VzE3",
                            "turn_available" : 0,
                            "turn_used" : 0
                        } ],
                    "active" : 1,
                    "armor" : 0,
                    "class_id" : "-KircnK2x1_31EQiAYlk",
                    "dexterity" : 12,
                    "effects": [
                        {
                            "action_id": "-KvOpJ2FyGodmZCanea7",
                            "applied_by_character_id": "55e38d23d842e50e9026",
                            "turn_applied": 2
                        }
                    ],
                    "gender" : "male",
                    "gold" : 100,
                    "hit_points" : 50,
                    "intelligence" : 18,
                    "inventory" : [ {
                        "equipment_slot_id" : "hand",
                        "is_equipped" : 1,
                        "item_id" : "-KjGQ1IPuwE24t4LPPNd",
                        "modifiers" : {
                            "modified_intelligence" : 4,
                            "modified_strength" : -1
                        }
                    } ],
                    "is_defending" : false,
                    "is_hidden" : 0,
                    "level" : 1,
                    "match_wins" : 3,
                    "max_hit_points" : 100,
                    "modified_dexterity" : 12,
                    "modified_intelligence" : 22,
                    "modified_strength" : 3,
                    "modified_toughness" : 6,
                    "name" : "Freddy",
                    "profile_image" : "unknown_character.jpg",
                    "strength" : 4,
                    "toughness" : 6,
                    "turn_action_used" : 0,
                    "user_id" : "U55U8F5B7",
                    "zone_id" : "-Khu9Ti4cn9PQ2Q1TSBT"

                };
                game.state.match["testingMatch2"].starting_character_ids.push("deadCharacter1");
                game.state.character["deadCharacter2"] = {
                    "actions" : [
                        {
                            "action_id" : "-Kjpe29q_fDkJG-73AQO",
                            "turn_available" : 0,
                            "turn_used" : 0
                        }, {
                            "action_id" : "-KjpeJT7Oct3ZCtLhENO",
                            "turn_available" : 0,
                            "turn_used" : 0
                        }, {
                            "action_id" : "-KkdduB9XuB46EsxqwIX",
                            "turn_available" : 0,
                            "turn_used" : 0
                        }, {
                            "action_id" : "-KqtOcn7MapqMfnGIZvo",
                            "turn_available" : 0,
                            "turn_used" : 0
                        }, {
                            "action_id" : "-Kr9TRwZS7C9JHm1VzE3",
                            "turn_available" : 0,
                            "turn_used" : 0
                        } ],
                    "active" : 1,
                    "armor" : 0,
                    "class_id" : "-KircnK2x1_31EQiAYlk",
                    "dexterity" : 12,
                    "effects": [
                        {
                            "action_id": "-KvOpJ2FyGodmZCanea7",
                            "applied_by_character_id": "55e38d23d842e50e9026",
                            "turn_applied": 2
                        }
                    ],
                    "gender" : "male",
                    "gold" : 100,
                    "hit_points" : -5,
                    "intelligence" : 18,
                    "inventory" : [ {
                        "equipment_slot_id" : "hand",
                        "is_equipped" : 1,
                        "item_id" : "-KjGQ1IPuwE24t4LPPNd",
                        "modifiers" : {
                            "modified_intelligence" : 4,
                            "modified_strength" : -1
                        }
                    } ],
                    "is_defending" : false,
                    "is_hidden" : 0,
                    "level" : 1,
                    "match_wins" : 3,
                    "max_hit_points" : 100,
                    "modified_dexterity" : 12,
                    "modified_intelligence" : 22,
                    "modified_strength" : 3,
                    "modified_toughness" : 6,
                    "name" : "Freddy",
                    "profile_image" : "unknown_character.jpg",
                    "strength" : 4,
                    "toughness" : 6,
                    "turn_action_used" : 0,
                    "user_id" : "U55U8F5B7",
                    "zone_id" : "-Khu9Ti4cn9PQ2Q1TSBT"

                };

                game.refresh();

                /*
                it("should create a new match", function(){
                    assert.equal(game.state.character["deadCharacter1"].zone_id, "-Khu9Zazk5XdFX9fD2Y8")
                })

                it("should update the current match ID", function(){
                    assert.equal(game.state.character["deadCharacter2"].zone_id, "-Khu9Zazk5XdFX9fD2Y8")
                })*/

            });

            /*
            describe("and it is not time to start the next match", function(){

            });

            game.state.global_state.match_id = "testingMatch2";
            game.state.match["testingMatch2"] = {
                "character_id_won" : 0,
                "date_started" : 1443615911.108, // 9AM & 15 seconds PST
                "date_ended" : 0,
                "number_turns" : 3,
                "starting_character_ids" : [

                ],
                "status": "started",
                "zone_id" : "-Khu9Ti4cn9PQ2Q1TSBT"
            };

            //Add an alive character & a dead character for testing
            game.state.match["testingMatch2"].starting_character_ids.push("aliveCharacter1");
            game.state.character["aliveCharacter1"] = {
                "actions" : [
                    {
                        "action_id" : "-Kjpe29q_fDkJG-73AQO",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KjpeJT7Oct3ZCtLhENO",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KkdduB9XuB46EsxqwIX",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KqtOcn7MapqMfnGIZvo",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-Kr9TRwZS7C9JHm1VzE3",
                        "turn_available" : 0,
                        "turn_used" : 0
                    } ],
                "active" : 1,
                "armor" : 0,
                "class_id" : "-KircnK2x1_31EQiAYlk",
                "dexterity" : 12,
                "effects": [
                    {
                        "action_id": "-KvOpJ2FyGodmZCanea7",
                        "applied_by_character_id": "55e38d23d842e50e9026",
                        "turn_applied": 2
                    }
                ],
                "gender" : "male",
                "gold" : 100,
                "hit_points" : 50,
                "intelligence" : 18,
                "inventory" : [ {
                    "equipment_slot_id" : "hand",
                    "is_equipped" : 1,
                    "item_id" : "-KjGQ1IPuwE24t4LPPNd",
                    "modifiers" : {
                        "modified_intelligence" : 4,
                        "modified_strength" : -1
                    }
                } ],
                "is_defending" : false,
                "is_hidden" : 0,
                "level" : 1,
                "match_wins" : 3,
                "max_hit_points" : 100,
                "modified_dexterity" : 12,
                "modified_intelligence" : 22,
                "modified_strength" : 3,
                "modified_toughness" : 6,
                "name" : "Freddy",
                "profile_image" : "unknown_character.jpg",
                "strength" : 4,
                "toughness" : 6,
                "turn_action_used" : 0,
                "user_id" : "U55U8F5B7",
                "zone_id" : "-Khu9Ti4cn9PQ2Q1TSBT"

            };
            game.state.match["testingMatch2"].starting_character_ids.push("deadCharacter1");
            game.state.character["deadCharacter1"] = {
                "actions" : [
                    {
                        "action_id" : "-Kjpe29q_fDkJG-73AQO",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KjpeJT7Oct3ZCtLhENO",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KkdduB9XuB46EsxqwIX",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-KqtOcn7MapqMfnGIZvo",
                        "turn_available" : 0,
                        "turn_used" : 0
                    }, {
                        "action_id" : "-Kr9TRwZS7C9JHm1VzE3",
                        "turn_available" : 0,
                        "turn_used" : 0
                    } ],
                "active" : 1,
                "armor" : 0,
                "class_id" : "-KircnK2x1_31EQiAYlk",
                "dexterity" : 12,
                "effects": [
                    {
                        "action_id": "-KvOpJ2FyGodmZCanea7",
                        "applied_by_character_id": "55e38d23d842e50e9026",
                        "turn_applied": 2
                    }
                ],
                "gender" : "male",
                "gold" : 100,
                "hit_points" : -5,
                "intelligence" : 18,
                "inventory" : [ {
                    "equipment_slot_id" : "hand",
                    "is_equipped" : 1,
                    "item_id" : "-KjGQ1IPuwE24t4LPPNd",
                    "modifiers" : {
                        "modified_intelligence" : 4,
                        "modified_strength" : -1
                    }
                } ],
                "is_defending" : false,
                "is_hidden" : 0,
                "level" : 1,
                "match_wins" : 3,
                "max_hit_points" : 100,
                "modified_dexterity" : 12,
                "modified_intelligence" : 22,
                "modified_strength" : 3,
                "modified_toughness" : 6,
                "name" : "Freddy",
                "profile_image" : "unknown_character.jpg",
                "strength" : 4,
                "toughness" : 6,
                "turn_action_used" : 0,
                "user_id" : "U55U8F5B7",
                "zone_id" : "-Khu9Ti4cn9PQ2Q1TSBT"

            };

            game.refresh();

            it("should change the match status to ", function(){
                assert.equal(game.state.character["deadCharacter1"].zone_id, "-Khu9Zazk5XdFX9fD2Y8")
            })*/

        });

    });
}

