"use strict";

const _ = require('lodash');

const NPC = require('../../models/NPC').NPC;
const Item = require('../../models/Item').Item;

const updateCallback = require('../../helpers').updateCallback;
const validateGameObjects = require('../../helpers').validateGameObjects;


const shopPurchaseMenu = gameObjects => {
    console.log('Called shopMainMenu/shopPurchaseMenu');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'slackCallback',
        'slackResponseTemplate'
    ]);

    //Add the previous 
    //TODO I should be able to add this as middleware.  We will always store the previous selection value 
    let updatedCallback = `${gameObjects.slackCallback}:${gameObjects.userActionValueSelection}/`;

    //gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    //Find the zone's NPC (for this zone I know there is only one NPC). To adjust in the future
    let npcID = _.find(gameObjects.game.state.npc, {zone_id: gameObjects.requestZone.id});

    let vendor = new NPC(gameObjects.game.state, npcID);

    let itemsForSaleArray = vendor.getItemsForSale();

    //Create a template dropdown of items based on the vendoor's items
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
                    "name": "",
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

    //let updatedCallback = gameObjects.slackCallback + ':shopPurchaseMenu/shopPurchaseMenu';

    //...:shopPurchaseMenu/shopPurchaseMenu
    
    //TODO I should already know the name of the selection in order to add it to the callback (should not hardcode)
    let updatedCallback2 = `${gameObjects.slackCallback}shopPurchaseMenu`;

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;
    
};

const shopSellMenu = gameObjects => {
    console.log('Called shopMainMenu/shopSellMenu');


};