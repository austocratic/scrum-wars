
const updateCallback = require('../../helpers/helpers').updateCallback;
const Item = require('../../models/Item').Item;


const inventorySelection = gameObjects => {
    console.log('called function selectInventoryMenu/inventorySelection');

    //Create a local item
    let itemSelected = new Item(gameObjects.game.state, gameObjects.userActionValueSelection);

    //Create an item detail view template
    gameObjects.slackResponseTemplate = itemSelected.getDetailView();

    gameObjects.slackResponseTemplate.attachments.push({
        "fallback": "unable to go back",
        "color": gameObjects.game.menuColor,
        "actions": [{
            "name": 'equip',
            "text": "Equip Item",
            "type": "button",
            "value": itemSelected.id
        },
        {
            "name": "back",
            "text": "Back",
            "type": "button",
            "value": "no"
        }]
    });

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `${gameObjects.slackCallback}itemDetailMenu`);

    return gameObjects.slackResponseTemplate;
};


module.exports = {
    inventorySelection
};
