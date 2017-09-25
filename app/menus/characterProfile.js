/*"use strict";

var Character_sync = require('../models/Character_sync').Character;



exports.characterProfile = async () => {

    console.log('hit equip_item condition in profileOptionSelection');

    var localGame = new Game();

    //Get the game's current state .state property
    await localGame.getState();

    //TODO could replace with a new Item call here (if I modify to be syncronous)
    var itemToEquip = localGame.state.item[payload.actions[0].value];

    //TODO need to figure out how to find a nested property locally
    //TODO or I should make a User object.  That user object will hold the player's character
    var player = localGame.state.player['slack_user_id', payload.user.id];

    //Use the player's character_id to set a local character
    var playerCharacter = new Character_sync(localGame.state.character[player.character_id]);

    playerCharacter.equipItem(itemToEquip);

    await localGame.updateState();

    return {
        'text': 'You equip ' + itemToEquip.name
    };
};


*/