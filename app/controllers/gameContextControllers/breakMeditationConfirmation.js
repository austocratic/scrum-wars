"use strict";

const updateCallback = require('../../helpers/helpers').updateCallback;
const slack = require('../../libraries/slack').sendMessage;
const getActionAttachments = require('../../helpers/getActionAttachments').getActionAttachments;

const yes = gameObjects => {
    console.log('called function breakMeditationConfirmation/yes');

    //gameObjects.playerCharacter.updateProperty('zone_id', gameObjects.requestZone.id);

    //Find meditation and remove it
    if(gameObjects.playerCharacter.props.effects){
        gameObjects.playerCharacter.props.effects.forEach( (eachEffect, index) => {
            //Delete that effect
            if (eachEffect.name === 'Meditation'){
                gameObjects.playerCharacter.props.effects.splice(index, 1);
            }
        })
    }

    slack({
        "username": gameObjects.playerCharacter.props.name,
        "icon_url": gameObjects.game.baseURL + gameObjects.game.avatarPath + gameObjects.playerCharacter.props.gender + '/' + gameObjects.playerCharacter.props.avatar,
        "channel": ("#" + gameObjects.requestZone.props.channel),
        "text": `_${gameObjects.playerCharacter.props.name} exits the meditative trance!_`
    });

    gameObjects.slackResponseTemplate.attachments = getActionAttachments(gameObjects);

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `breakMeditationConfirmation:yes/selectActionMenu`);

    return gameObjects.slackResponseTemplate;
};

const no = gameObjects => {
    console.log('called function breakMeditationConfirmation/no');

    gameObjects.slackResponseTemplate = {
        "text": "_You remain in your meditative trance!_"
    };

    return gameObjects.slackResponseTemplate;
};


module.exports = {
    yes,
    no
};