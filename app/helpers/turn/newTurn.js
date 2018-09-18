"use strict";

const _ = require('lodash');
const validateGameObjects = require('../helpers').validateGameObjects;
const slack = require('../../libraries/slack').sendMessage;

const newTurn = gameObjects => {

    validateGameObjects(gameObjects, [
        'game',
        'arenaZone',
        'currentMatch'
    ]);

    //Increase the match turn property
    gameObjects.currentMatch.incrementTurn();

    //Increment all character's Action Points
    let gameCharacters = gameObjects.game.getCharacters();

    //TODO hard coded 10% regen rate
    const REGEN_RATE = .1;

    // REPLACE WITH MANA & STAMINA REGEN
    //Increase each character's action points by 10
    gameCharacters.forEach( eachGameCharacter =>{

        //Determine the character's maximum mana
        let manaRegenAmount = eachGameCharacter.props.stats_current.mana * REGEN_RATE;

        eachGameCharacter.regenerateMana(manaRegenAmount)
    });

    slack({
        "username": gameObjects.arenaZone.props.zone_messages.name,
        "icon_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + gameObjects.arenaZone.props.zone_messages.image + '.bmp',
        "channel": ("#" + gameObjects.arenaZone.props.channel),
        "attachments": [{
            "text": "_A new turn begins!_",
            "color": gameObjects.game.menuColor
        }]
    });
};

module.exports = {
    newTurn
};