"use strict";

const _ = require('lodash');
const updateCallback = require('../../helpers').updateCallback;

let NPC = require('../../models/NPC').NPC;


const shop = gameObjects => {

    let npcID = _.findKey(gameObjects.game.state.npc, singleNPC => {
        {return singleNPC['zone_id'] === gameObjects.requestZone.id}
    });

    let vendor = new NPC(gameObjects.game.state, npcID);

    let itemsForSaleArray = vendor.getItemsForSale();

    var slackTemplateDropdown = itemsForSaleArray.map( itemID =>{
        var localItem = gameObjects.game.state.item[itemID];

        return {
            "text": localItem.name,
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
    
    
    let updatedCallback = gameObjects.slackCallback + ':' + gameObjects.userActionValueSelection + '/selectActionMenu';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;
};


module.exports = {
    shop
};
