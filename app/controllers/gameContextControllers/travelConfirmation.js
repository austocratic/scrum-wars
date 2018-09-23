"use strict";

const updateCallback = require('../../helpers/helpers').updateCallback;

const slackAlert = require('../../libraries/slack').Alert;

const yes = gameObjects => {
    console.log('called function travelConfirmation/yes');

    //Determine if attempting to travel to the arena
    if(gameObjects.requestZone.name === "The Arena" && gameObjects.currentMatch.status === 'started'){
        console.log('Info: a character attempted to travel to the arena');

        //Create object to send to Slack
        gameObjects.slackResponseTemplate = {
            "username": gameObjects.playerCharacter.props.name,
            "icon_url": gameObjects.game.baseURL + gameObjects.game.avatarPath + gameObjects.playerCharacter.props.gender + '/' + gameObjects.playerCharacter.props.avatar,
            "channel": ("#" + gameObjects.requestZone.props.channel),
            "text": "_You are unable to travel to this zone because a match has already started!_"
        };

        return gameObjects.slackResponseTemplate;
    }

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
