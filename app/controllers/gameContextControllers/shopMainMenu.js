"use strict";

const _ = require('lodash');

const NPC = require('../../models/NPC').NPC;
const Item = require('../../models/Item').Item;

const updateCallback = require('../../helpers').updateCallback;
const validateGameObjects = require('../../helpers').validateGameObjects;


const purchaseButton = gameObjects => {
    console.log('Called shopMainMenu/purchaseButton');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'slackCallback',
        'slackResponseTemplate'
    ]);

    //Due to the DB data structure, I use _findKey()
    let npcID = _.findKey(gameObjects.game.state.npc, {zone_id: gameObjects.requestZone.id});

    let vendor = new NPC(gameObjects.game.state, npcID);

    let itemsForSaleArray = vendor.getItemsForSale();

    //Create a template dropdown of items based on the vendor's items
    let slackTemplateDropdown = itemsForSaleArray.map( itemID =>{
        let itemSelectionOption = new Item(gameObjects.game.state, itemID);

        return {
            "text": itemSelectionOption.props.name,
            "value": itemID
        }
    });

    //shopPurchaseMenu
    gameObjects.slackResponseTemplate = {
        "text": "_The vendor smiles at you warmly_ \nOf course my friend!  Have a look around, I have many items that could help you on your travels",
        "attachments": [
            {
                "fallback": "Choose an item",
                "callback_id": "",
                "color": gameObjects.game.menuColor,
                "attachment_type": "default",
                "image_url": gameObjects.game.baseURL + gameObjects.game.imagePath + 'weapon-shop-1.png',
                "actions": [{
                    "name": "itemList",
                    "text": "Choose an item to purchase",
                    "type": "select",
                    "options": slackTemplateDropdown
                }]
            },
            {
                "text": "",
                "fallback": "You are unable to go back",
                "callback_id": "shopCharacterSelection",
                "color": gameObjects.game.menuColor,
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "back",
                        "text": "Back",
                        "style": "",
                        "type": "button",
                        "value": "back"
                    }
                ]
            }
        ]
    };

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}shopPurchaseMenu`);

    return gameObjects.slackResponseTemplate;
    
};

const sellButton = gameObjects => {
    console.log('Called shopMainMenu/sellButton');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'slackCallback',
        'slackResponseTemplate'
    ]);

    gameObjects.slackResponseTemplate = {
        "text": "_The vendor smiles at you eagerly_ \nOf course, I'm always looking for new items to purchase!",
        "attachments": [
            {
                "fallback": "Choose an item",
                "callback_id": "",
                "color": gameObjects.game.menuColor,
                "attachment_type": "default",
                "image_url": gameObjects.game.baseURL + gameObjects.game.imagePath + 'weapon-shop-1.png',
                "actions": [{
                    "name": "itemList",
                    "text": "Choose an item to purchase",
                    "type": "select"
                }]
            },
            {
                "text": "",
                "fallback": "You are unable to go back",
                "callback_id": "",
                "color": gameObjects.game.menuColor,
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "back",
                        "text": "Back",
                        "style": "",
                        "type": "button",
                        "value": "back"
                    }
                ]
            }
        ]
    };

    let unequippedItemOptions =

        //Get the unequipped items then map into slack format
        gameObjects.playerCharacter.getUnequippedItems()
            .map(eachItem => {
                return {
                    "text": eachItem.name,
                    "value": eachItem.item_id
                }
            });

    //If the character has unequipped items return a drop down, else return "no items"
    if (unequippedItemOptions.length > 0){

        gameObjects.slackResponseTemplate.attachments[0] =
            {
                "text": "",
                "color": gameObjects.game.menuColor,
                "fallback": "You are unable to select that item"
            };

        gameObjects.slackResponseTemplate.attachments[0].actions =
            [{
                "name": "itemList",
                "type": "select",
                "options": unequippedItemOptions
            }]
    } else {
        gameObjects.slackResponseTemplate.attachments[0] =
            {
                "text": "Your backpack is empty!",
                "fallback": "Unable to process"
            }
    }

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}shopSellMenu`);

    return gameObjects.slackResponseTemplate;
};


module.exports = {
    purchaseButton,
    sellButton,
};
