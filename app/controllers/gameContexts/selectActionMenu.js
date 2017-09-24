"use strict";

const _ = require('lodash');

const NPC = require('../../models/NPC').NPC;
const Item = require('../../models/Item').Item;
const updateCallback = require('../../helpers').updateCallback;
const validateGameObjects = require('../../helpers').validateGameObjects;
const targetSelection = require('../targetSelection').getTargetSelectionMenu;



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

const defensive = gameObjects => {

};

const quickStrike = gameObjects => {
    console.log('Called selectActionMenu/quickStrike');

    validateGameObjects(gameObjects, [
        'game', //ok
        'requestZone', //ok
        'playerCharacter', //ok
        'slackCallback', //ok
        'userActionValueSelection', //ok
        'slackResponseTemplate' //ok
    ]);

    return targetSelection(gameObjects);
    
    /*
    gameObjects.slackResponseTemplate = {
        "attachments": [
        {
            "text": "",
            "callback_id": "",
            "fallback": "unable to select an option",
            "actions": [
                {
                    "name": "processActionOnTarget",
                    "text": "Select a target",
                    "type": "select",
                    "options": []
                }]
        }]
    };

    let characterIDsInZone = gameObjects.game.getCharacterIDsInZone(gameObjects.requestZone.id);

    let filteredCharacterIDs = characterIDsInZone.filter( eachCharacterID =>{
        return eachCharacterID !== gameObjects.playerCharacter.id
    });
    
    gameObjects.slackResponseTemplate.attachments[0].actions[0].options = filteredCharacterIDs.map( singleCharacterID => {
        return {
            "text": gameObjects.game.state.character[singleCharacterID].name,
            //"style": "primary",
            //"type": "button",
            "value": singleCharacterID
        }
    });
    
    //Set the callback, will be assigned at end of switch
    let updatedCallback = gameObjects.slackCallback + ':' + gameObjects.userActionValueSelection + '/selectActionTarget';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;*/
};





const lifeTap = gameObjects => {

};
const forkedLightning = gameObjects => {

};
const intoShadow = gameObjects => {

};
const savageStrike = gameObjects => {

};
const balanced = gameObjects => {

};
const backstab = gameObjects => {

};

const arcaneBolt = gameObjects => {

};

module.exports = {
    shop,
    quickStrike
};
