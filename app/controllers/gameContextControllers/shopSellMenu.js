"use strict";

const updateCallback = require('../../helpers/helpers').updateCallback;
const validateGameObjects = require('../../helpers/helpers').validateGameObjects;
const Item = require('../../models/Item').Item;


const itemList = gameObjects => {
    console.log('called function shopSellMenu/itemList');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'slackCallback',
        'slackResponseTemplate',
        'userActionNameSelection',
        'userActionValueSelection'
    ]);

    //Create a local item
    let itemSelected = new Item(gameObjects.game.state, gameObjects.userActionValueSelection);

    //Create an item detail view template
    gameObjects.slackResponseTemplate = itemSelected.getDetailView();

    gameObjects.slackResponseTemplate.attachments.push({
        "text": `I'll give you ${itemSelected.props.cost * .6} for it!`,
        "color": gameObjects.game.menuColor,
        "fallback": "You can't select this item",
        "title": "",
        "actions": [
            {
                "name": "yesSellButton",
                "text": "Sell Item",
                "type": "button",
                "value": "yesButton"
            },
            {
                "name": "back",
                "text": "No thanks",
                "type": "button",
                "value": "no"
            }]
    });

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}itemDetailMenu`);

    return gameObjects.slackResponseTemplate;

};



module.exports = {
    itemList
};
