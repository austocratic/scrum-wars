
const updateCallback = require('../../helpers').updateCallback;
const Item = require('../../models/Item').Item;


const equipmentSelection = gameObjects => {
    console.log('called function selectEquipmentMenu/equipmentSelection');

    //Create a local item
    let itemSelected = new Item(gameObjects.game.state, gameObjects.userActionValueSelection);

    //Create an item detail view template
    gameObjects.slackResponseTemplate = itemSelected.getDetailView();

    //Add purchase button to the last attachment
    //gameObjects.slackResponseTemplate.attachments[gameObjects.slackResponseTemplate.attachments.length - 1].actions = [];

    gameObjects.slackResponseTemplate.attachments.push({
        "fallback": "unable to go back",
        "actions": [{
            "name": 'unequip',
            "fallback": "unable to select item",
            "text": "Unequip Item",
            "type": "button",
            "value": itemSelected.id
        },
        {
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
    equipmentSelection
};
