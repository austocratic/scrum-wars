"use strict";

const _ = require('lodash');
const updateCallback = require('../../helpers').updateCallback;

let NPC = require('../../models/NPC').NPC;


const shop = gameObjects => {

    let npcID = _.findKey(gameObjects.game.state.npc, singleNPC => {
        {return singleNPC['zone_id'] === gameObjects.requestZone.id}
    });

    let vendor = new NPC(gameObjects.game.state, npcID);

    let itemsForSaleArray = vendor.getItemsForSale();

    var slackTemplateDropdown = itemsForSaleArray.map( itemID =>{
        let localItem = gameObjects.game.state.item[itemID];

        return {
            "text": localItem.functionName,
            "value": itemID
        }
    });

    gameObjects.slackResponseTemplate = {
        "text": "_You enter the general store and the merchant greets you warmly_ \nHello there traveler!  Welcome to my shop.  What can I interest you in?",
        "attachments": [
            {
                "fallback": "You are unable to choose an action",
                "callback_id": "shopCharacterSelection",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "image_url": "https://scrum-wars.herokuapp.com/public/images/fullSize/" + vendor.id + ".jpg",
                "actions": []
            },
            {
                "fallback": "You are unable to choose an action",
                "callback_id": "shopCharacterSelection",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [{
                    "name": "selectItem",
                    "text": "Choose an item to purchase",
                    "type": "select",
                    "options": slackTemplateDropdown
                }]
            },
            {
                "text": "",
                "fallback": "You are unable to go back",
                "callback_id": "shopCharacterSelection",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "back",
                        "text": "Exit shop",
                        "style": "",
                        "type": "button",
                        "value": "back"
                    }
                ]
            }
        ]
    };

    let updatedCallback = gameObjects.slackCallback + ':' + gameObjects.userActionValueSelection + '/selectItemShopMenu';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;
};

const tavern = gameObjects => {

};

const defensive = gameObjects => {

};

const quickStrike = gameObjects => {

    //actionResponse = gameContext.getCharactersInZone(localZone.id, requestSlackUserID);

    gameObjects.slackResponseTemplate = {
        "attachments": [
        {
            "text": "",
            "callback_id": "",
            "actions": [
                {
                    "name": "processActionOnTarget", 
                    "type": "select",
                    "options": []
                }]
        }]
    };

    let characterIDsInZone = gameObjects.game.getCharacterIDsInZone(gameObjects.requestZone.id);

    var filteredCharacterIDs = _.remove(characterIDsInZone, eachCharacterID =>{
        //If a character ID is not equal to the player's character ID, it stays (remove player's character)
        return eachCharacterID !== gameObjects.playerCharacter.id
    });

    //Iterate through the character Ids formatting into slack format
    gameObjects.slackResponseTemplate = filteredCharacterIDs.forEach(singleCharacterID => {
        slackTemplate.attachments[0].actions[0].options.push({
            //"name": singleCharacterID,
            "text": gameObjects.game.state.character[singleCharacterID].name,
            //"style": "primary",
            //"type": "button",
            "value": singleCharacterID
        });
    });
    
    //Set the callback, will be assigned at end of switch
    let updatedCallback = gameObjects.slackCallback + ':' + gameObjects.userActionValueSelection + '/selectActionTarget';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;

};
const lifeTap = gameObjects => {

};
const forkedLightning = gameObjects => {

};
const intoShadow = gameObjects => {

};
const savageStrike = gameObjects => {

};
const balanced = gameObjects => {

};
const backstab = gameObjects => {

};

const arcaneBolt = gameObjects => {

};

module.exports = {
    shop,
    quickStrike
};
