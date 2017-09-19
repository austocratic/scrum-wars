"use strict";


const updateCallback = require('../../helpers').updateCallback;


const inventory = gameObjects => {
    console.log('called function characterProfileMenu/inventory');

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

    console.log('DEBUG, unequippedItemOptions: ', unequippedItemOptions);

    //If the character has unequipped items return a drop down, else return "no items"
    if (unequippedItemOptions.length > 0){

        gameObjects.slackResponseTemplate.attachments[1] =
        {
            "text": "",
            "fallback": "You are unable to select that item"
        };

        gameObjects.slackResponseTemplate.attachments[1].actions =
            [{
                "name": "itemList",
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

    let updatedCallback = ':Inventory/inventoryList';

    //TODO this was the format in the function before refactor.  Need to see why the new version below works or does not work
    //gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, (requestCallback + updatedCallback));

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    console.log('DEBUG slackResponseTemplate: ', gameObjects.slackResponseTemplate);

    return gameObjects.slackResponseTemplate;
};

const equipment = gameObjects => {
    console.log('called function characterProfileMenu/equipment');

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

    //gameObjects.slackResponseTemplate.attachments.push(equipmentSlackTemplateAttachments)
    
    //console.log('DEBUG: equipmentSlackTemplateAttachments: ', equipmentSlackTemplateAttachments);

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

    let updatedCallback = ':Equipment/equipmentList';

    //TODO this was the format in the function before refactor.  Need to see why the new version below works or does not work
    //gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, (requestCallback + updatedCallback));

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;
};

const exit = gameObjects => {
    console.log('called function characterProfileMenu/exit');

    gameObjects.slackResponseTemplate = {
        "text": "Does this message show up?  Remove from controller",
        "delete_original": true
    };

    return gameObjects.slackResponseTemplate;
};

module.exports = {
    inventory,
    equipment,
    exit
};