"use strict";

const updateCallback = require('../../helpers').updateCallback;
const validateGameObjects = require('../../helpers').validateGameObjects;

const Item = require('../../models/Item').Item;

const yesButton = gameObjects => {
    console.log('called function itemDetailMenu/yesButton');
    
    //Parse the slackCallback
    let slackCallbackElements = gameObjects.slackCallback.split("/");

    console.log('DEBUG: slackCallbackElements: ', slackCallbackElements);

    //Get the item ID from the callback, it is found in the 2nd to last element of the parsed callback
    let itemSelection = slackCallbackElements[slackCallbackElements.length - 3];

    console.log('DEBUG: itemSelection: ', itemSelection);

    let valueSelection = itemSelection.split(":");

    console.log('DEBUG: valueSelection: ', valueSelection);

    let itemID = valueSelection[valueSelection.length - 1];

    console.log('DEBUG: itemID: ', itemID);
    
    let itemToPurchase = new Item(gameObjects.game.state, itemID);

    return gameObjects.playerCharacter.purchaseItem(itemToPurchase);
    
};

const yesSellButton = gameObjects => {
    console.log('called function itemDetailMenu/yesSellButton');

    //Parse the slackCallback
    let slackCallbackElements = gameObjects.slackCallback.split("/");

    console.log('DEBUG: slackCallbackElements: ', slackCallbackElements);

    //Get the item ID from the callback, it is found in the 2nd to last element of the parsed callback
    let itemSelection = slackCallbackElements[slackCallbackElements.length - 3];

    console.log('DEBUG: itemSelection: ', itemSelection);

    let valueSelection = itemSelection.split(":");

    console.log('DEBUG: valueSelection: ', valueSelection);

    let itemID = valueSelection[valueSelection.length - 1];

    console.log('DEBUG: itemID: ', itemID);

    let itemToSell = new Item(gameObjects.game.state, itemID);

    //TODO currently passing the sale rate through by hard coding.  Need a better way
    return gameObjects.playerCharacter.sellItem(itemToSell, .6);

};

const equip = gameObjects => {
    console.log('called function itemDetailMenu/equip');

    //Parse the slackCallback
    let slackCallbackElements = gameObjects.slackCallback.split("/");

    console.log('DEBUG itemDetailMenu/equip, slackCallbackElements: ', slackCallbackElements);

    //Get the item ID from the callback, it is found in the 2nd to last element of the parsed callback
    let itemSelection = slackCallbackElements[slackCallbackElements.length - 2];

    let valueSelection = itemSelection.split(":");

    console.log('DEBUG itemDetailMenu/equip, valueSelection: ', valueSelection);

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
        } else {
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
    yesButton,
    yesSellButton,
    equip,
    unequip
};
