'use strict';

var request = require('request');
var assert = require('assert');
var _ = require('lodash');

var testDB = require('../testDB');
var Game = require('../../models/Game').Game;
var Character = require('../../models/Character').Character;
var Item = require('../../models/Item').Item;

var testGame = new Game();

//Set the game's state based on local testing DB
testGame.state = testDB;

//Calculate properties in memory
testGame.inititate();

var testCharacterID = '-Kkxf1ukVSF9VV6mIPlG';

describe("character.purchaseItem() ", function() {

    var testCharacter = new Character(testGame.state, testCharacterID);
    var testItem = new Item(testGame.state, '-KjGQ1IPuwE24t4LPPNd');

    var inventoryArrayLengthBeforePurchase = testCharacter.props.inventory.length;
    
    testCharacter.purchaseItem(testItem);

    it("should increase the character's inventory property (array) length by 1", function(done) {

        var inventoryArrayLengthAfterPurchase = testCharacter.props.inventory.length;
        
        assert.equal((inventoryArrayLengthAfterPurchase - inventoryArrayLengthBeforePurchase), 1);

        done();

    });
    it("should add a item with matching item id", function(done) {

        var testPass = 0;

        if (_.findIndex(testCharacter.props.inventory, {item_id: testItem.id}) >= 0){
            testPass = 1;
        }

        assert.equal(testPass, 1);

        done();

    });
});

describe("character.getUnequippedItems() ", function() {

    var testCharacter = new Character(testGame.state, testCharacterID);
    
    var unequippedItems = testCharacter.getUnequippedItems();
    
    console.log('unequippedItems: ', unequippedItems);

    it("should return an array of length >= 0", function(done) {

        var testPass = 0;

        if (unequippedItems.length >= 0){
            testPass = 1;
        }

        assert.equal(testPass, 1);

        done();

    });
});