"use strict";

const _ = require('lodash');

const updateCallback = require('../../helpers').updateCallback;
const Action = require('../../models/Action').Action;
const slackAlert = require('../../libraries/slack').Alert;

const action = gameObjects => {
    console.log('called function command/action');

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

    //If character already took an action this turn return the no action available template
    /* TODO commented out check for if action is already taken to make testing easier
     if (actionsUsedThisTurn.length > 0) {
     return slackTemplates.actionAlreadyTaken;
     }*/

    //TODO I think this function should replace the one above:
    //Determine if any action was already taken this turn, if so return the action taken template
    //var actionsUsedThisTurn = localCharacter.getActionsUsedOnTurn(localMatch.props.number_turns);
    
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

    //Group the actions for slack (this will add a lodash wrapper)
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
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": []
            };

            actionCategory.forEach(actionDetails => {

                //Default button color to red ("danger").  If available, it will be overwritten
                let actionAvailableButtonColor = "danger";

                //If the button is available based on the match turn, overwrite the color to green
                if (gameObjects.playerCharacter.isActionAvailable(actionDetails.id, gameObjects.currentMatch.props.number_turns)) {
                    actionAvailableButtonColor = "primary"
                }

                //Push each action into the actions array portion of the template
                attachmentTemplate.actions.push({
                    "name": actionDetails.props.functionName,
                    "text": actionDetails.props.name,
                    "style": actionAvailableButtonColor,
                    "type": "button",
                    "value": actionDetails.props.functionName
                });
            });
            return attachmentTemplate
        });

    //Use .value() to unwrap the lodash wrapper
    gameObjects.slackResponseTemplate.attachments = templateAttachments.value();

    let updatedCallback = 'command:action/selectActionMenu';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;
};

const generate = gameObjects => {
    console.log('slackRequest called function command/generate');

    gameObjects.slackResponseTemplate.attachments =
        [{
            "text": "Hail traveler, are you ready to embark on a NEW faithful journey to lands uncharted and depths unknown?  All your previous progress will be lost",
            "fallback": "You are unable to choose an action",
            "callback_id": "characterSelectionNew",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "yes",
                    "text": "I head the call",
                    "style": "primary",
                    "type": "button",
                    "value": "yes"

                },
                {
                    "name": "no",
                    "text": "Nay, I shall continue on my current path",
                    "style": "danger",
                    "type": "button",
                    "value": "no"
                }
            ]
        }];

    let updatedCallback = 'command:generate/generateCharacterConfirmation';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate
};

const profile = gameObjects => {
    console.log('slackRequest called function command/profile');

    gameObjects.slackResponseTemplate.attachments =
        [{
            "title": gameObjects.playerCharacter.props.name + "'s Profile",
            "fallback": "Unable to load character image",
            "image_url": "https://scrum-wars.herokuapp.com/" + gameObjects.playerCharacter.props.avatar,
            "fields": [
            ]
        },
        {
            "fallback": "Unable to load character stats",
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
                    "title": "Max Health",
                    "value": gameObjects.playerCharacter.props.max_hit_points,
                    "short": true
                },
                {
                    "title": "Strength",
                    "value": gameObjects.playerCharacter.props.modified_strength,
                    "short": true
                },
                {
                    "title": "Intelligence",
                    "value": gameObjects.playerCharacter.props.modified_intelligence,
                    "short": true
                },
                {
                    "title": "Dexterity",
                    "value": gameObjects.playerCharacter.props.modified_dexterity,
                    "short": true
                },
                {
                    "title": "Toughness",
                    "value": gameObjects.playerCharacter.props.modified_toughness,
                    "short": true
                },
                {
                    "title": "Armor",
                    "value": gameObjects.playerCharacter.props.armor,
                    "short": true
                }
            ]
        },
        {
            "callback_id": "profileOptionSelection",
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
    
    let updatedCallback = 'command:profile/characterProfileMenu';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback);

    return gameObjects.slackResponseTemplate;
};

const travel = gameObjects => {
    console.log('slackRequest called function command/travel');

    //Update the zone_id property locally
    gameObjects.playerCharacter.updateProperty('zone_id', gameObjects.requestZone.id);

    //Alert the channel
    let channelAlert = new slackAlert({
        "username": "A mysterious voice",
        "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
        "channel": ("#" + gameObjects.requestZone.props.channel),
        "text": (gameObjects.playerCharacter.props.name + ' has entered ' + gameObjects.requestZone.props.name)
    });

    channelAlert.sendToSlack();
    
    //Create object to send to Slack
    gameObjects.slackResponseTemplate = {
        "username": "A mysterious voice",
        "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
        "channel": ("#" + gameObjects.requestZone.props.channel),
        "text": (gameObjects.playerCharacter.props.name + ' has entered ' + gameObjects.requestZone.props.name)
    };

    return gameObjects.slackResponseTemplate;
};

const name = gameObjects => {
    console.log('slackRequest called function command/name');

    //Attempt to find a character.  If this returns undefined, name does not exist
    if(_.findKey(gameObjects.game.state.character, {'name': gameObjects.slackTextInput})){

        gameObjects.slackResponseTemplate = {
            "user_name": "A mysterious voice",
            "text": "I fear that there is another who goes by this name, what should we call you instead?"
        };

    } else {

        //Update the characters name property locally
        gameObjects.playerCharacter.updateProperty('name', gameObjects.slackTextInput);

        gameObjects.slackResponseTemplate = {
            "user_name": "A mysterious voice",
            "text": "Well met traveler, " + gameObjects.slackTextInput
        };
    }

    return gameObjects.slackResponseTemplate;
};


module.exports = {
    action,
    generate,
    profile,
    travel,
    name
};







let response = {
    text: "fslkfjlsdajfl ",
    attachments: {
        //action stuff
    }
}