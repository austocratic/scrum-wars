"use strict";

const updateCallback = require('../../helpers').updateCallback;
const validateGameObjects = require('../../helpers').validateGameObjects;


const inventory = gameObjects => {
    console.log('called function characterProfileMenu/inventory');

    validateGameObjects(gameObjects, [
        'playerCharacter',
        'slackResponseTemplate', 
        'slackCallback' 
    ]);

    gameObjects.slackResponseTemplate = {
        "attachments": [
        {
            "text": "",
            "fallback": "Unable to process image",
            "callback_id": "itemList",
            "image_url": "https://scrum-wars.herokuapp.com/assets/fullSize/inventory-menu.jpg",
            "actions": []
        },
        {
            "text": "",
            "callback_id": "itemList",
            "actions": []
        },
        {
            "text": "",
            "fallback": "You are unable to go back",
            "callback_id": "itemList",
            "color": "#3AA3E3",
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
        }]
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

        gameObjects.slackResponseTemplate.attachments[1] =
        {
            "text": "",
            "fallback": "You are unable to select that item"
        };

        gameObjects.slackResponseTemplate.attachments[1].actions =
            [{
                "name": "inventorySelection",
                "type": "select",
                "options": unequippedItemOptions
            }]
    } else {
        gameObjects.slackResponseTemplate.attachments[1] =
        {
            "text": "Your backpack is empty!",
            "fallback": "Unable to process"
        }
    }

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}selectInventoryMenu`);

    //let updatedCallback = ':inventory/selectInventoryMenu';
    //gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, (gameObjects.slackCallback + updatedCallback));

    return gameObjects.slackResponseTemplate;
};

const equipment = gameObjects => {
    console.log('called function characterProfileMenu/equipment');

    validateGameObjects(gameObjects, [
        'playerCharacter',
        'slackResponseTemplate',
        'slackCallback'
    ]);

    gameObjects.slackResponseTemplate = {
        "attachments": [
        {
            "text": "",
            "fallback": "You are unable to go back",
            "actions": [
                {
                    "name": "equipmentList",
                    "type": "select",
                    "options": []
                }]
        },
        {
            "text": "",
            "fallback": "You are unable to go back",
            "callback_id": "equipmentList",
            "color": "#3AA3E3",
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
        }]
    };

    gameObjects.slackResponseTemplate.attachments = gameObjects.game.getEquippedItemView(gameObjects.playerCharacter);

    //getEquipmentList above overwrites attachments on template.  Add a back button here
    gameObjects.slackResponseTemplate.attachments.push({
        "text": "",
        "fallback": "You are unable to go back",
        "callback_id": "itemList",
        "color": "#3AA3E3",
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
    });

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}selectEquipmentMenu`);

    //let updatedCallback = ':equipment/selectEquipmentMenu';
    
    //gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, (gameObjects.slackCallback + updatedCallback));

    return gameObjects.slackResponseTemplate;
};

const exit = gameObjects => {
    console.log('called function characterProfileMenu/exit');

    validateGameObjects(gameObjects, [
        'slackResponseTemplate'
    ]);

    gameObjects.slackResponseTemplate = {
        "text": "_You exit your profile_",
        "delete_original": true
    };

    return gameObjects.slackResponseTemplate;
};

module.exports = {
    inventory,
    equipment,
    exit
};