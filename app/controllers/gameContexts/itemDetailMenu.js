"use strict";

const updateCallback = require('../../helpers').updateCallback;
const Item = require('../../models/Item').Item;


const yes = gameObjects => {
    console.log('called function itemDetailMenu/yes');
    
    //Parse the slackCallback
    let slackCallbackElements = gameObjects.slackCallback.split("/");

    //Get the item ID from the callback, it is found in the 2nd to last element of the parsed callback
    let itemSelection = slackCallbackElements[slackCallbackElements.length - 2];

    let valueSelection = itemSelection.split(":");

    let itemID = valueSelection[valueSelection.length - 1];
    
    let itemToPurchase = new Item(gameObjects.game.state, itemID);

    return gameObjects.playerCharacter.purchaseItem(itemToPurchase);
    
};

const equip = gameObjects => {
    console.log('called function itemDetailMenu/equip');

    //Parse the slackCallback
    let slackCallbackElements = gameObjects.slackCallback.split("/");

    //Get the item ID from the callback, it is found in the 2nd to last element of the parsed callback
    let itemSelection = slackCallbackElements[slackCallbackElements.length - 2];

    let valueSelection = itemSelection.split(":");

    let itemID = valueSelection[valueSelection.length - 1];

    let itemToEquip = new Item(gameObjects.game.state, itemID);

    gameObjects.slackResponseTemplate = {
        text: 'You equip ' + itemToEquip.props.name
    };

    //Verify that the character does not have an item equipped in any of the new item's slots
    itemToEquip.props.equipment_slot_id.forEach( eachEquipmentSlotID =>{

        let equipmentInSlot = gameObjects.playerCharacter.getEquipmentInSlot(eachEquipmentSlotID);

        if (equipmentInSlot.length === 0){
            gameObjects.playerCharacter.equipItem(itemToEquip);

            gameObjects.slackResponseTemplate.text = 'You can not equip that item because you already have an item equipped in that slot!'
        }
    });

    return gameObjects.slackResponseTemplate;

};

const unequip = gameObjects => {
    console.log('called function itemDetailMenu/unequip');

    //Parse the slackCallback
    let slackCallbackElements = gameObjects.slackCallback.split("/");
    
    //Get the item ID from the callback, it is found in the 2nd to last element of the parsed callback
    let itemSelection = slackCallbackElements[slackCallbackElements.length - 2];

    let valueSelection = itemSelection.split(":");

    let itemID = valueSelection[valueSelection.length - 1];

    let itemToUnequip = new Item(gameObjects.game.state, itemID);

    gameObjects.playerCharacter.unequipItem(itemID);

    gameObjects.slackResponseTemplate = {
        text: 'You unequip ' + itemToUnequip.props.name
    };
    
    return gameObjects.slackResponseTemplate

};


module.exports = {
    yes,
    equip,
    unequip
};
