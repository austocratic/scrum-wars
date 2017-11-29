/* TO DELETE - replaced by shopPurchaseMenu.js



const updateCallback = require('../../helpers').updateCallback;
const Item = require('../../models/Item').Item;


const selectItem = gameObjects => {
    console.log('called function selectItemShopMenu/selectItem');

    //Create a local item
    let itemSelected = new Item(gameObjects.game.state, gameObjects.userActionValueSelection);

    //Create an item detail view template
    gameObjects.slackResponseTemplate = itemSelected.getDetailView();

    //Add purchase buttons to the bottom of the template
    gameObjects.slackResponseTemplate.attachments[0].actions = [{
        "name": "yes",
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

    let updatedCallback = gameObjects.slackCallback + ':' + gameObjects.userActionValueSelection + '/itemDetailMenu';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;

};





module.exports = {
    selectItem
};
*/