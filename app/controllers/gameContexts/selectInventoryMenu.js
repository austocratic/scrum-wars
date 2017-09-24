
const updateCallback = require('../../helpers').updateCallback;
const Item = require('../../models/Item').Item;


const inventorySelection = gameObjects => {
    console.log('called function selectInventoryMenu/inventorySelection');

    //Create a local item
    let itemSelected = new Item(gameObjects.game.state, gameObjects.userActionValueSelection);

    //Create an item detail view template
    gameObjects.slackResponseTemplate = itemSelected.getDetailView();

    gameObjects.slackResponseTemplate.attachments[0].actions = [{
        "name": 'equip',
        "text": "Equip Item",
        "fallback": "unable to select item",
        "type": "button",
        "value": itemSelected.id
    }];

    gameObjects.slackResponseTemplate.attachments.push({
        "actions": [{
            "name": "back",
            "text": "Back",
            "fallback": "unable to go back",
            "type": "button",
            "value": "no"
        }]
    });
    
    let updatedCallback = gameObjects.slackCallback + ':' + gameObjects.userActionValueSelection + '/itemDetailMenu';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;
};


module.exports = {
    inventorySelection
};
