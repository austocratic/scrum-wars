
const updateCallback = require('../../helpers').updateCallback;
const Item = require('../../models/Item').Item;


const equipmentSelection = gameObjects => {
    console.log('called function selectEquipmentMenu/equipmentSelection');

    //Create a local item
    let itemSelected = new Item(gameObjects.game.state, gameObjects.userSelection);

    //Create an item detail view template
    gameObjects.slackResponseTemplate = itemSelected.getDetailView();

    //Add purchase buttons to the bottom of the template
    gameObjects.slackResponseTemplate = {
        "attachments": [{
            "name": 'unequip',
            "fallback": "unable to select item",
            "text": "Unequip Item",
            "type": "button",
            "value": itemSelected.id
        },
        {
            "name": "back",
            "fallback": "unable to go back",
            "text": "Back",
            "type": "button",
            "value": "no"
        }]
    };
    
    let updatedCallback = gameObjects.slackCallback + ':' + gameObjects.userSelection + '/itemDetailMenu';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;
};


module.exports = {
    equipmentSelection
};
