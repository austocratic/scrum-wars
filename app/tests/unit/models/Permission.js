"use strict";

const assert = require('assert');

const testDB = require('../../testDB');

const Game = require('../../../models/Game').Game;
const Permission = require('../../../models/Permission').Permission;

let game = new Game();
game.state = testDB;


describe("Testing Permission model", function() {

    describe("instantiating new Permission with Observer permission set", function(){

        let testPermission = new Permission(game.state, '-KztKzvAkoPFhI3ShzCu');

        it("should not be undefined", function(){
            assert(testPermission)
        });

        describe("calling method canAccessSlashCommand", function(){

            describe("with a slash command that the permission has access to", function(){
                it("should evaluate to true", function(){
                    assert(testPermission.canAccessSlashCommand('rankings'))
                })
            });

            describe("with a slash command that the permission does not have access to", function(){
                it("should evaluate to false", function(){
                    assert.notEqual(testPermission.canAccessSlashCommand('profile'), false)
                })
            });
        })
    });
});
