"use strict";

const _ = require('lodash');

const NPC = require('../../models/NPC').NPC;
const Item = require('../../models/Item').Item;
const Action = require('../../models/Action').Action;
const Character = require('../../models/Character').Character;
const updateCallback = require('../../helpers').updateCallback;
const validateGameObjects = require('../../helpers').validateGameObjects;
const targetSelection = require('../targetSelection').getTargetSelectionMenu;

const actionControllers = {
    defensiveStance: require('../actionController').DefensiveStance
};

//Shop does not use the actionController class right now
const shop = gameObjects => {
    console.log('Called selectActionMenu/shop');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'slackCallback',
        'slackResponseTemplate'
    ]);

    let npcID = _.findKey(gameObjects.game.state.npc, singleNPC => {
        {return singleNPC['zone_id'] === gameObjects.requestZone.id}
    });

    let vendor = new NPC(gameObjects.game.state, npcID);

    let itemsForSaleArray = vendor.getItemsForSale();

    let slackTemplateDropdown = itemsForSaleArray.map( itemID =>{
        //let localItem = gameObjects.game.state.item[itemID];
        let itemSelectionOption = new Item(gameObjects.game.state, itemID);

        return {
            "text": itemSelectionOption.props.name,
            "value": itemID
        }
    });

    gameObjects.slackResponseTemplate = {
        "text": "_You enter the general store and the merchant greets you warmly_ \nHello there traveler!  Welcome to my shop.  What can I interest you in?",
        "attachments": [
            {
                "fallback": "You are unable to choose an action",
                "callback_id": "shopCharacterSelection",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "image_url": "https://scrum-wars.herokuapp.com/public/images/fullSize/" + vendor.id + ".jpg",
                "actions": []
            },
            {
                "fallback": "You are unable to choose an action",
                "callback_id": "shopCharacterSelection",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [{
                    "name": "selectItem",
                    "text": "Choose an item to purchase",
                    "type": "select",
                    "options": slackTemplateDropdown
                }]
            },
            {
                "text": "",
                "fallback": "You are unable to go back",
                "callback_id": "shopCharacterSelection",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "back",
                        "text": "Exit shop",
                        "style": "",
                        "type": "button",
                        "value": "back"
                    }
                ]
            }
        ]
    };

    let updatedCallback = gameObjects.slackCallback + ':shop/selectItemShopMenu';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;
};
const tavern = gameObjects => {

};
const defensiveStance = gameObjects => {
    console.log('Called selectActionMenu/defensiveStance');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'currentMatch' ,
        'userActionValueSelection'
    ]);
    
    //User selected a target character ID.  Create a character for that target
    //let targetCharacter = new Character(gameObjects.game.state, gameObjects.userActionValueSelection);
    gameObjects.targetCharacter = gameObjects.playerCharacter;
    
    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //constructor(actionCharacter, targetCharacter, currentZone, currentMatch, actionTaken)
    /*
    let actionObject = new actionControllers['defensiveStance'](
        gameObjects.playerCharacter,
        gameObjects.targetCharacter,
        gameObjects.requestZone,
        gameObjects.currentMatch,
        'defensiveStance'
    );*/
    
    let actionObject = new actionControllers['defensiveStance'](gameObjects);

    actionObject.initiate();
};
const balanced = gameObjects => {

};

//*******  These actions require a target, so will return selectActionTarget game context  *******

const quickStrike = gameObjects => {
    console.log('Called selectActionMenu/quickStrike');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'slackCallback',
        'userActionValueSelection',
        'slackResponseTemplate'
    ]);

    return targetSelection(gameObjects);
};
const lifeTap = gameObjects => {
    console.log('Called selectActionMenu/lifeTap');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'slackCallback',
        'userActionValueSelection',
        'slackResponseTemplate'
    ]);

    return targetSelection(gameObjects);
};
const arcaneBolt = gameObjects => {
    console.log('Called selectActionMenu/arcaneBolt');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'slackCallback',
        'userActionValueSelection',
        'slackResponseTemplate'
    ]);

    return targetSelection(gameObjects);
};
const forkedLightning = gameObjects => {

};
const intoShadow = gameObjects => {

};
const savageStrike = gameObjects => {

};
const backstab = gameObjects => {

};

module.exports = {
    shop,
    defensiveStance,
    quickStrike,
    arcaneBolt,
    lifeTap
};
