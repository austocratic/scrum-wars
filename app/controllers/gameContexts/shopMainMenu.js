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

    //Find the zone's NPC (for this zone I know there is only one NPC). To adjust in the future
    let npcID = _.find(gameObjects.game.state.npc, {zone_id: gameObjects.requestZone.id});

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
            /*TO UPDATE IMAGE{
                "fallback": "You are unable to choose an action",
                "callback_id": "",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "image_url": "https://scrum-wars.herokuapp.com/public/images/fullSize/" + vendor.id + ".jpg",
                "actions": []
            },*/
            {
                "fallback": "Choose an item",
                "callback_id": "",
                "color": gameObjects.game.menuColor,
                "attachment_type": "default",
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
                        "text": "Exit shop",
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


};


module.exports = {
    purchaseButton,
    sellButton,
};
