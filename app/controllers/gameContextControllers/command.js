"use strict";

const _ = require('lodash');

const slack = require('../../libraries/slack');
//to delete (shuld use slack library above)
const slackAlert = require('../../libraries/slack').Alert;

const updateCallback = require('../../helpers').updateCallback;
const validateGameObjects = require('../../helpers').validateGameObjects;

const Action = require('../../models/Action').Action;
const Match = require('../../models/Match').Match;

const action = gameObjects => {
    console.log('called function command/action');

    if(!gameObjects.user.getCharacterID()){
        return {
            "text": "I'm sorry traveler, but it seems that you have not yet created a character, type /generate to begin your journey"
        }
    }

    validateGameObjects(gameObjects, [
        'game',
        'user',
        'slackResponseTemplate',
        'playerCharacter',
        'requestZone',
        'currentMatch',
        'characterClass'
    ]);

    //Test if the player's character is not in the zone where the player initiated the action command
    if (gameObjects.playerCharacter.props.zone_id !== gameObjects.requestZone.id) {
        
        gameObjects.slackResponseTemplate.text =  "_You can't perform an action in a zone that your character is not in_";

        gameObjects.slackResponseTemplate.attachments = [{
            image_url: "https://scrum-wars.herokuapp.com/public/images/fullSize/" + gameObjects.requestZone.id + ".jpg",
            fallback: "Unable to travel to " + gameObjects.requestZone.props.name + " at this time",
            text: "Would you like to travel to " + gameObjects.requestZone.props.name + " now?",
            actions: [
                {
                    "name": "yes",
                    "text": "Yes",
                    "type": "button",
                    "value": "yes"
                },
                {
                    "name": "no",
                    "text": "No",
                    "type": "button",
                    "value": "no"
                }
            ]
        }];

        let updatedCallback = 'command:action/travelConfirmation';

        gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

        return gameObjects.slackResponseTemplate;
    }

    if (gameObjects.playerCharacter.getActionsUsedOnTurn(gameObjects.currentMatch.props.number_turns).length > 0) {
        //An action was used this turn, return a message

        gameObjects.slackResponseTemplate = {
            "text": "You have already taken an action this turn, wait until next turn"
            //TODO I could add a message saying how long until the next turn
        };

        return gameObjects.slackResponseTemplate
    }
    
    //Returns an array of all the character's action IDs with is_active = 1
    let actionIDsAvailable = gameObjects.playerCharacter.getActionIDs();

    //Use action IDs to make an array of action objects
    let actionObjectsAvailable = actionIDsAvailable
        .map( eachActionID =>{
            return new Action(gameObjects.game.state, eachActionID);
        })
        .filter( eachActionObject =>{
            return _.indexOf(eachActionObject.props.zone_id, gameObjects.requestZone.id) > -1;
        });

    //Group the actionControllers for slack (this will add a lodash wrapper)
    let groupedActions = _(actionObjectsAvailable)
        .groupBy(singleAction => {
            return singleAction.props.type;
        });

    let templateAttachments = groupedActions
        .map(actionCategory => {

            //Build the template
            let attachmentTemplate = {
                "title": actionCategory[0].props.type,
                "fallback": "You are unable to choose an action",
                "color": gameObjects.game.menuColor,
                "attachment_type": "default",
                "actions": []
            };

            actionCategory.forEach(actionDetails => {

                //Default button color to red ("danger").  If available, it will be overwritten
                let actionAvailableButtonColor = "danger";

                //If the button is available based on the match turn, overwrite the color to green
                if (gameObjects.playerCharacter.isActionAvailable(actionDetails, gameObjects.currentMatch.props.number_turns)) {
                    actionAvailableButtonColor = "primary"
                }

                //Push each action into the actionControllers array portion of the template
                attachmentTemplate.actions.push({
                    "name": actionDetails.props.functionName,
                    "text": actionDetails.props.name,
                    "style": actionAvailableButtonColor,
                    "type": "button",
                    "value": actionDetails.id
                });
            });
            return attachmentTemplate
        });

    //Use .value() to unwrap the lodash wrapper
    gameObjects.slackResponseTemplate.attachments = templateAttachments.value();

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `command:action/selectActionMenu`);

    return gameObjects.slackResponseTemplate;
};

const generate = gameObjects => {
    console.log('slackRequest called function command/generate');

    validateGameObjects(gameObjects, [
        'game',
        'user',
        'slackResponseTemplate'
    ]);

    gameObjects.slackResponseTemplate.attachments =
        [{
            "text": "Are you sure you want to generate a *new* character?  Any previous character will be made inactive",
            "fallback": "You are unable to choose an action",
            "callback_id": "",
            "color": gameObjects.game.menuColor,
            "attachment_type": "default",
            "actions": [
                {
                    "name": "yes",
                    "text": "Yes",
                    "style": "primary",
                    "type": "button",
                    "value": "yes"

                },
                {
                    "name": "no",
                    "text": "No",
                    "style": "danger",
                    "type": "button",
                    "value": "no"
                }
            ]
        }];

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `command:action/generateCharacterConfirmation`);

    return gameObjects.slackResponseTemplate
};

const profile = gameObjects => {
    console.log('slackRequest called function command/profile');

    if(!gameObjects.user.getCharacterID()){
        return {
            "text": "I'm sorry traveler, but it seems that you have not yet created a character, type /generate to begin your journey"
        }
    }

    validateGameObjects(gameObjects, [
        'game',
        'characterClass', 
        'playerCharacter',
        'slackResponseTemplate'
    ]);

    gameObjects.slackResponseTemplate.attachments = [
        {
            "title": gameObjects.playerCharacter.props.name + "'s Profile",
            "fallback": "Unable to load character image",
            "image_url": gameObjects.game.baseURL + gameObjects.game.avatarPath + gameObjects.playerCharacter.props.gender + '/' + gameObjects.playerCharacter.props.avatar,
            "fields": [
            ]
        },
        {
            "fallback": "Unable to load character stats",
            "color": gameObjects.game.menuColor,
            "fields": [
                {
                    "title": "Class",
                    "value": gameObjects.characterClass.props.name,
                    "short": false
                },
                {
                    "title": "Gold",
                    "value": gameObjects.playerCharacter.props.gold,
                    "short": false
                },
                {
                    "title": "Current Health",
                    "value": gameObjects.playerCharacter.props.health,
                    "short": true
                },
                {
                    "title": "Max Health",
                    "value": `${gameObjects.playerCharacter.props.stats_base.hit_points} + ${gameObjects.playerCharacter.props.stats_current.hit_points - gameObjects.playerCharacter.props.stats_base.hit_points} = ${gameObjects.playerCharacter.props.stats_current.hit_points}`,
                    "short": true
                },
                {
                    "title": "Strength",
                    "value": `${gameObjects.playerCharacter.props.stats_base.strength} + ${gameObjects.playerCharacter.props.stats_current.strength - gameObjects.playerCharacter.props.stats_base.strength} = ${gameObjects.playerCharacter.props.stats_current.strength}`,
                    "short": true
                },
                {
                    "title": "Intelligence",
                    "value": `${gameObjects.playerCharacter.props.stats_base.intelligence} + ${gameObjects.playerCharacter.props.stats_current.intelligence - gameObjects.playerCharacter.props.stats_base.intelligence} = ${gameObjects.playerCharacter.props.stats_current.intelligence}`,
                    "short": true
                },
                {
                    "title": "Dexterity",
                    "value": `${gameObjects.playerCharacter.props.stats_base.dexterity} + ${gameObjects.playerCharacter.props.stats_current.dexterity - gameObjects.playerCharacter.props.stats_base.dexterity} = ${gameObjects.playerCharacter.props.stats_current.dexterity}`,
                    "short": true
                },
                {
                    "title": "Toughness",
                    "value": `${gameObjects.playerCharacter.props.stats_base.toughness} + ${gameObjects.playerCharacter.props.stats_current.toughness - gameObjects.playerCharacter.props.stats_base.toughness} = ${gameObjects.playerCharacter.props.stats_current.toughness}`,
                    "short": true
                },
                {
                    "title": "Armor",
                    "value": `${gameObjects.playerCharacter.props.stats_base.armor} + ${gameObjects.playerCharacter.props.stats_current.armor - gameObjects.playerCharacter.props.stats_base.armor} = ${gameObjects.playerCharacter.props.stats_current.armor}`,
                    "short": true
                }
            ]
        },
        {
            "callback_id": "profileOptionSelection",
            "color": gameObjects.game.menuColor,
            "fallback": "Unable to load inventory buttons",
            "actions": [{
                "name": "inventory",
                "text": "Inventory",
                "style": "default",
                "type": "button",
                "value": "inventory"
            },
            {
                "name": "equipment",
                "text": "Equipped Items",
                "style": "default",
                "type": "button",
                "value": "equipment"
            },
            {
                "name": "exit",
                "text": "Exit",
                "style": "default",
                "type": "button",
                "value": "exit"
            }]
        }];

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, `command:profile/characterProfileMenu`);

    return gameObjects.slackResponseTemplate;
};

const travel = gameObjects => {
    console.log('slackRequest called function command/travel');

    if(!gameObjects.user.getCharacterID()){
        return {
            "text": "I'm sorry traveler, but it seems that you have not yet created a character, type /generate to begin your journey"
        }
    }

    validateGameObjects(gameObjects, [
        'game',
        'characterClass',
        'playerCharacter',
        'slackResponseTemplate'
    ]);

    //Update the zone_id property locally
    gameObjects.playerCharacter.updateProperty('zone_id', gameObjects.requestZone.id);

    //Alert the channel
    let channelAlert = new slackAlert({
        "username": gameObjects.playerCharacter.props.name,
        "icon_url": gameObjects.game.baseURL + gameObjects.game.avatarPath + gameObjects.playerCharacter.props.gender + '/' + gameObjects.playerCharacter.props.avatar,
        "channel": ("#" + gameObjects.requestZone.props.channel),
        "text": (gameObjects.playerCharacter.props.name + ' has entered ' + gameObjects.requestZone.props.name)
    });

    channelAlert.sendToSlack();

    //Create object to send to Slack
    gameObjects.slackResponseTemplate = {
        "username": gameObjects.playerCharacter.props.name,
        "icon_url": gameObjects.game.baseURL + gameObjects.game.avatarPath + gameObjects.playerCharacter.props.gender + '/' + gameObjects.playerCharacter.props.avatar,
        "channel": ("#" + gameObjects.requestZone.props.channel),
        "text": "_You travel to a new zone_"
    };

    return gameObjects.slackResponseTemplate;
};

const name = gameObjects => {
    console.log('slackRequest called function command/name');

    if(!gameObjects.user.getCharacterID()){
        return {
            "text": "I'm sorry traveler, but it seems that you have not yet created a character, type /generate to begin your journey"
        }
    }

    validateGameObjects(gameObjects, [
        'game',
        'characterClass',
        'playerCharacter',
        'slackText',
        'slackResponseTemplate'
    ]);

    //Attempt to find a character.  If this returns undefined, name does not exist
    if(_.findKey(gameObjects.game.state.character, {'name': gameObjects.slackText})){

        gameObjects.slackResponseTemplate = {
            "user_name": "A mysterious voice",
            "text": "I fear that there is another who goes by this name, what should we call you instead?"
        };

    } else {

        //Update the characters name property locally
        gameObjects.playerCharacter.updateProperty('name', gameObjects.slackText);

        gameObjects.slackResponseTemplate = {
            "user_name": "A mysterious voice",
            "text": "Well met traveler, " + gameObjects.slackText
        };
    }

    return gameObjects.slackResponseTemplate;
};

//Admin commands

//Increment the match turn
const turn = gameObjects => {
    console.log('slackRequest called function command/turn');

    validateGameObjects(gameObjects, [
        'requestZone',
        'currentMatch'
    ]);

    gameObjects.currentMatch.incrementTurn(gameObjects.requestZone);

    return {
        "text": "You increment the match's turn"
    }
};

//End the current match & start a new match
const match = gameObjects => {
    console.log('slackRequest called function command/match');

    validateGameObjects(gameObjects, [
        'requestZone',
        'game',
        'currentMatch'
    ]);

    //End current match
    //Passing in a blank winning character
    gameObjects.currentMatch.end('');

    //Pass in old match zone when creating the new match
    let newMatchID = gameObjects.game.createMatch(gameObjects.currentMatch.props.zone_id);

    //Setup a new match
    let newMatch = new Match(gameObjects.game.state, newMatchID);

    //Update the global state to new match id
    gameObjects.game.state.global_state.match_id = newMatchID;

    //Get participating characters:
    let charactersInZone = gameObjects.game.getCharactersInZone(gameObjects.currentMatch.props.zone_id);

    console.log('DEBUG charactersInZone: ', charactersInZone);

    /*
    gameObjects.game.getCharactersInZone(gameObjects.currentMatch.props.zone_id)
        .forEach( eachCharacterInZone =>{
            eachCharacterInZone.resetActions();
        });*/

    //For characters participating in the match, reset their actions
    charactersInZone.forEach( eachCharacterInZone =>{
        eachCharacterInZone.resetActions();
    });

    //Start the new match
    newMatch.start(gameObjects.game.getCharacterIDsInZone(gameObjects.currentMatch.props.zone_id));

    //Announce that new match has begun
    slack.sendMessage({
        "username": this.actionCharacter.props.name,
        //"icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
        "channel": ("#" + gameObjects.requestZone.props.channel),
        "text":
            `Ladies and Gentlemen, feast your eyes on this bloody spectacle!
            \n_A new match begins!_`
    });

    return {
        "text": "You create a new match"
    }

};

module.exports = {
    action,
    generate,
    profile,
    travel,
    name,
    turn,
    match
};






