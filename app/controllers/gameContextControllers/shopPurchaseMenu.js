"use strict";

const updateCallback = require('../../helpers/helpers').updateCallback;
const validateGameObjects = require('../../helpers/helpers').validateGameObjects;
const Item = require('../../models/Item').Item;


const itemList = gameObjects => {
    console.log('called function shopPurchaseMenu/itemList');

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

    //Add purchase buttons to the bottom of the template
    gameObjects.slackResponseTemplate.attachments[0].actions = [{
            "name": "yesButton",
            "text": "Yes, I'll take it!",
            "type": "button",
            "value": "yesButton"
        },
        {
            "name": "back",
            "text": "No thanks",
            "type": "button",
            "value": "back"
        }];
    
    //let updatedCallback = gameObjects.slackCallback + ':' + gameObjects.userActionValueSelection + '/itemDetailMenu';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}itemDetailMenu`);

    return gameObjects.slackResponseTemplate;

};



module.exports = {
    itemList
};
