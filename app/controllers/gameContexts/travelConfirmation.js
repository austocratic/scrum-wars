"use strict";

const updateCallback = require('../../helpers').updateCallback;

const slackAlert = require('../../libraries/slack').Alert;

const yes = gameObjects => {
    console.log('called function travelConfirmation/yes');

    gameObjects.playerCharacter.updateProperty('zone_id', gameObjects.requestZone.id);

    //Alert the channel
    //TODO same as command/travel, possible combine?
    let channelAlert = new slackAlert({
        "username": "A mysterious voice",
        "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
        "channel": ("#" + gameObjects.requestZone.props.channel),
        "text": (gameObjects.playerCharacter.props.name + ' has entered ' + gameObjects.requestZone.props.name)
    });

    //TODO can I make this chainable?
    channelAlert.sendToSlack();

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
