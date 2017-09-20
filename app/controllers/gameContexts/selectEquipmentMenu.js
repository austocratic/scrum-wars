
const updateCallback = require('../../helpers').updateCallback;
const Item = require('../../models/Item').Item;


const equipmentSelection = gameObjects => {
    console.log('called function selectEquipmentMenu/equipmentSelection');

    //Create a local item
    let itemSelected = new Item(gameObjects.game.state, gameObjects.userActionValueSelection);

    //Create an item detail view template
    gameObjects.slackResponseTemplate = itemSelected.getDetailView();

    //Add purchase buttons to the bottom of the template
    gameObjects.slackResponseTemplate.attachments[0].actions = [{
            "name": 'unequip',
            "fallback": "unable to select item",
            "text": "Unequip Item",
            "type": "button",
            "value": itemSelected.id
        }];

    gameObjects.slackResponseTemplate.attachments[1] = {
        "name": "back",
        "text": "Back",
        "fallback": "unable to go back",
        "type": "button",
        "value": "no"
    };
    
    
    let updatedCallback = gameObjects.slackCallback + ':' + gameObjects.userActionValueSelection + '/itemDetailMenu';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;
};


module.exports = {
    equipmentSelection
};
