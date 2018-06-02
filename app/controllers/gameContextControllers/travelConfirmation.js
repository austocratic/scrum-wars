"use strict";

const updateCallback = require('../../helpers').updateCallback;

const slackAlert = require('../../libraries/slack').Alert;

const yes = gameObjects => {
    console.log('called function travelConfirmation/yes');

    gameObjects.playerCharacter.updateProperty('zone_id', gameObjects.requestZone.id);
    
    let channelAlert = new slackAlert({
        "username": gameObjects.playerCharacter.props.name,
        "icon_url": gameObjects.game.baseURL + gameObjects.game.avatarPath + gameObjects.playerCharacter.props.gender + '/' + gameObjects.playerCharacter.props.avatar,
        "channel": ("#" + gameObjects.requestZone.props.channel),
        "text": (gameObjects.playerCharacter.props.name + ' has entered ' + gameObjects.requestZone.props.name)
    });

    channelAlert.sendToSlack();

    //console.log('DEBUG sent travel message to slack')

    //Return the response to the player
    gameObjects.slackResponseTemplate = {
        "text": "You enter " + gameObjects.requestZone.props.name
    };

    return gameObjects.slackResponseTemplate;
};

const no = gameObjects => {
    console.log('called function travelConfirmation/no');

    gameObjects.slackResponseTemplate = {
        "text": "You remain in your current zone"
    };

    return gameObjects.slackResponseTemplate;
};





module.exports = {
    yes,
    no
};
