"use strict";

const updateCallback = require('../../helpers').updateCallback;
const Item = require('../../models/Item').Item;


const itemDetailMenu = gameObjects => {
    console.log('called function shopPurchaseMenu/itemDetailMenu');

    //Add the previous 
    //TODO I should be able to add this as middleware.  We will always store the previous selection value 
    let updatedCallback = `${gameObjects.slackCallback}:${gameObjects.userActionValueSelection}/`;

    //Create a local item
    let itemSelected = new Item(gameObjects.game.state, gameObjects.userActionValueSelection);

    //Create an item detail view template
    gameObjects.slackResponseTemplate = itemSelected.getDetailView();

    //Add purchase buttons to the bottom of the template
    gameObjects.slackResponseTemplate.attachments[0].actions = [{
            "name": "yesConfirmation",
            "text": "Yes, I'll take it!",
            "type": "button",
            "value": "yes"
        },
        {
            "name": "back",
            "text": "No thanks",
            "type": "button",
            "value": "no"
        }];

    //Full current flow: always store context & either name or value of selection
    //selectActionMenu:shop/shopMainMenu:shopPurchaseMenu/shopPurchaseMenu:k2j3rn32u4u/itemDetailMenu:yes/other menu if necessary

    //Potential flow: always store previous name (same as context) & the value:
    //selectActionMenu:shopMainMenu/shopMainMenu:shopPurchaseMenu/shopPurchaseMenu:k2j3rn32u4u/itemDetailMenu:yes/purchaseConfirmationMenu:yes       
    
    
    
    //Next view:
    
    let updatedCallback = gameObjects.slackCallback + ':' + gameObjects.userActionValueSelection + '/itemDetailMenu';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;

};





module.exports = {
    itemDetailMenu
};
