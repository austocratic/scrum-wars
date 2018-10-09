"use strict";

const _ = require('lodash');

const slack = require('../../libraries/slack').sendMessage;
const getActionAttachments = require('../../helpers/getActionAttachments').getActionAttachments;
const updateCallback = require('../../helpers/helpers').updateCallback;
const validateGameObjects = require('../../helpers/helpers').validateGameObjects;
const newTurn = require('../../helpers/turn/newTurn').newTurn;
const checkForTravelToArenaAndMatchStart = require('../../helpers/gameContextHelpers/travelHelpers').checkForTravelToArenaAndMatchStart;

const Action = require('../../models/Action').Action;
const Match = require('../../models/Match').Match;
const Class = require('../../models/Class').Class;

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
            "color": gameObjects.game.menuColor,
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

    //Test if character is in the arena, but the match has not yet started, return "unable to perform action" message
    if(gameObjects.requestZone.props.name === "The Arena" && gameObjects.currentMatch.props.status !== 'started'){
        return {
            "username": gameObjects.playerCharacter.props.name,
            "icon_url": gameObjects.game.baseURL + gameObjects.game.avatarPath + gameObjects.playerCharacter.props.gender + '/' + gameObjects.playerCharacter.props.avatar,
            "channel": ("#" + gameObjects.requestZone.props.channel),
            "text": "_You are unable to perform an action since a match has not yet started!_"
        }
    };

    //Meditation check
    if (gameObjects.playerCharacter.props.effects){
        let meditationEffect = _.find(gameObjects.playerCharacter.props.effects, {name: 'Meditation'});

        //console.log('DEBUG meditationEffect: ', meditationEffect);

        //If character does have a meditation effect, return a confirmation view
        if (meditationEffect !== undefined){
            gameObjects.slackResponseTemplate.text =  "_You are currently meditating_";

            gameObjects.slackResponseTemplate.attachments = [{
                //image_url: "https://scrum-wars.herokuapp.com/public/images/fullSize/" + gameObjects.requestZone.id + ".jpg",
                fallback: "requestFallback",
                text: "Would you like to end your meditation now?",
                "color": gameObjects.game.menuColor,
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

            let updatedCallback = 'command:action/breakMeditationConfirmation';

            gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

            return gameObjects.slackResponseTemplate;
        }
    }

    gameObjects.slackResponseTemplate.attachments = getActionAttachments(gameObjects);

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
            "color": gameObjects.game.menuColor,
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
                    "value": gameObjects.playerCharacter.props.hit_points,
                    "short": true
                },
                {
                    "title": "Current Stamina",
                    "value": gameObjects.playerCharacter.props.stamina_points,
                    "short": true
                },
                {
                    "title": "Current Mana",
                    "value": gameObjects.playerCharacter.props.mana_points,
                    "short": true
                },
                {
                    "title": "Max Health",
                    "value": `${gameObjects.playerCharacter.props.stats_base.health} + ${gameObjects.playerCharacter.props.stats_current.health - gameObjects.playerCharacter.props.stats_base.health} = ${gameObjects.playerCharacter.props.stats_current.health}`,
                    "short": true
                },
                {
                    "title": "Max Mana",
                    "value": `${gameObjects.playerCharacter.props.stats_base.mana} + ${gameObjects.playerCharacter.props.stats_current.mana - gameObjects.playerCharacter.props.stats_base.mana} = ${gameObjects.playerCharacter.props.stats_current.mana}`,
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
        'slackResponseTemplate',
        'currentMatch',
        'requestZone'
    ]);

    //Check if character attempting to travel to arena & match already started
    let arenaAndMatchStartResponse = checkForTravelToArenaAndMatchStart(gameObjects)

    console.log('DEBUG, arenaAndMatchStartResponse: ', arenaAndMatchStartResponse);

    if(arenaAndMatchStartResponse !== undefined){
        return arenaAndMatchStartResponse
    }

    slack({
        "username": gameObjects.playerCharacter.props.name,
        "icon_url": gameObjects.game.baseURL + gameObjects.game.avatarPath + gameObjects.playerCharacter.props.gender + '/' + gameObjects.playerCharacter.props.avatar,
        "channel": ("#" + gameObjects.requestZone.props.channel),
        "text": (gameObjects.playerCharacter.props.name + ' has entered ' + gameObjects.requestZone.props.name)
    });

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
    console.log('Info: slackRequest called function command/name');

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

const ranking = gameObjects => {
    console.log('Info: slackRequest called function command/ranking');

    validateGameObjects(gameObjects, [
        'game'
    ]);

    //Create a list of all characters
    let allCharacters = gameObjects.game.getCharacters();

    let sortedCharacters = _.sortBy(allCharacters, characters =>{
        return characters.props.match_wins
    });

    //Sorted ascending, need to reverse the order to sort descending
    sortedCharacters.reverse();

    let slackResponse = {};

    //Iterate through list of ranked characters building a template
    slackResponse.attachments = sortedCharacters.map( eachSortedCharacter =>{

        let characterClass = new Class(gameObjects.game.state, eachSortedCharacter.props.class_id);

        return {
            "text": "",
            "color": gameObjects.game.menuColor,
            "thumb_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + eachSortedCharacter.props.avatar,
            "fields": [
                {
                    "title": "Name",
                    "value": eachSortedCharacter.props.name,
                    "short": true
                },
                {
                    "title": "Match Wins",
                    "value": eachSortedCharacter.props.match_wins,
                    "short": true
                },
                {
                    "title": "Character Class",
                    "value": characterClass.props.name,
                    "short": true
                }]
        }
    });

    return slackResponse
};

const list = gameObjects => {
    console.log('Info: slackRequest called function command/list');

    validateGameObjects(gameObjects, [
        'game'
    ]);

    //Create a list of all characters in the arena
    let allCharacters = gameObjects.game.getCharactersInArena();

    let sortedCharacters = _.sortBy(allCharacters, characters =>{
        return characters.props.match_wins
    });

    //Sorted ascending, need to reverse the order to sort descending
    sortedCharacters.reverse();

    let slackResponse = {};

    //Iterate through list of ranked characters building a template
    slackResponse.attachments = sortedCharacters.map( eachSortedCharacter =>{

        let characterClass = new Class(gameObjects.game.state, eachSortedCharacter.props.class_id);

        return {
            "text": "",
            "color": gameObjects.game.menuColor,
            "thumb_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + eachSortedCharacter.props.avatar,
            "fields": [
                {
                    "title": "Name",
                    "value": eachSortedCharacter.props.name,
                    "short": true
                },
                {
                    "title": "Class",
                    "value": characterClass.props.name,
                    "short": true
                },
                {
                    "title": "Current HP",
                    "value": `${eachSortedCharacter.props.hit_points} / ${gameObjects.playerCharacter.props.stats_current.health}`,
                    "short": true
                },
                {
                    "title": "Current MP",
                    "value": `${eachSortedCharacter.props.mana_points} / ${gameObjects.playerCharacter.props.stats_current.mana}`,
                    "short": true
                },
                {
                    "title": "Current SP",
                    "value": `${eachSortedCharacter.props.stamina_points} / ${gameObjects.playerCharacter.props.stats_current.stamina}`,
                    "short": true
                }
               ]
        }
    });

    return slackResponse


}

//Admin commands

//Increment the match turn
const turn = gameObjects => {
    console.log('slackRequest called function command/turn');

    validateGameObjects(gameObjects, [
        'requestZone',
        'currentMatch'
    ]);

    newTurn(gameObjects);

    return {
        "text": "You increment the match's turn"
    }
};

//End the current match & start a new match
const match = gameObjects => {
    console.log('Info: slackRequest called function command/match');

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

    try {
        //For characters participating in the match, reset their actions
        charactersInZone.forEach( eachCharacterInZone =>{

            //console.log('DEBUG: command/match iterating eachCharacterInZone');

            eachCharacterInZone.resetActions();

            //console.log('DEBUG resetting characters properties... before update ', JSON.stringify(eachCharacterInZone.props));

            //Reset HP/MP/VP:
            eachCharacterInZone.updateProperty('hit_points', eachCharacterInZone.props.stats_current.health);
            eachCharacterInZone.updateProperty('mana_points', eachCharacterInZone.props.stats_current.mana);
            eachCharacterInZone.updateProperty('stamina_points', eachCharacterInZone.props.stats_current.stamina);
            eachCharacterInZone.updateProperty('vigor_points', 0);

            //console.log('DEBUG resetting characters properties... after update ', JSON.stringify(eachCharacterInZone.props));
        });
    } catch (err){
        console.log('ERROR: processing command/match charactersInZone loop')
    }

    //Start the new match
    newMatch.start(gameObjects.game.getCharacterIDsInZone(gameObjects.currentMatch.props.zone_id));

    //Announce that new match has begun
    slack({
        "username": gameObjects.requestZone.props.zone_messages.name,
        "icon_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + gameObjects.requestZone.props.zone_messages.image + '.bmp',
        "channel": ("#" + gameObjects.requestZone.props.channel),
        "attachments": [{
            "text":
                `Ladies and Gentlemen, feast your eyes on this bloody spectacle!
                \n_A new match begins!_`,
            "color": gameObjects.game.menuColor
        }]
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
    ranking,
    list,
    turn,
    match
};






