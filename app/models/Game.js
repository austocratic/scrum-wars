'use strict';

var Firebase = require('../libraries/firebase').Firebase;
var firebase = new Firebase();



var User = require('./User').User;
var Character = require('./Character').Character;
var Zone = require('./Zone').Zone;
var Match = require('./Match').Match;
var Merchant = require('./Merchant').Merchant;
var Action = require('./Action').Action;
var slackTemplates = require('../slackTemplates');

var moveCharacter = require('../components/zone/moveCharacter').moveCharacter;
var _ = require('lodash');





class Game {
    //TODO see if async works for constructor here
    constructor() {

        //this.state = await this.getState()
    }

    //Get state of the game from DB
    async getState(){
        
        //Get the current state of the game
        this.state = await firebase.get();

        //console.log('Got the value from firebase: ', firebaseReturn);

        //Convert the returned object into array of IDs.  This works since the query only returns one result
        //TODO need to add a way for it to verify only one result (could return multiple results)


        //var id = Object.keys(firebaseReturn)[0];
        //this.state = firebaseReturn[id];
    }

    //Push local state to the DB
    //DONT MODIFY THIS
    async updateState(){
        return await firebase.update('', this.state)
    }
    
    getCurrentMatchID(){

        return this.state.global_state.match_id

    }

    characterTravel(requestSlackUserID, requestSlackChannelID) {
        
        //Pass in the slack user id making the call.  The constructor will set the DB user ID based on slack user
        var localUser = new User(this.state, requestSlackUserID);

        //Get the local character's id
        var characterID = localUser.getCharacterID();

        //Create a local character object
        var localCharacter = new Character(this.state, characterID);

        //Create a local zone object
        var localZone = new Zone(this.state, requestSlackChannelID);

        //Update the zone_id property locally
        localCharacter.updateProperty('zone_id', localZone.id);

        //Update the game state for a certain character only based on the localCharacter
        this.state.character[localCharacter.id] = localCharacter.props;

        //Create object to send to
        var travelAlertDetails = {
            "username": "A mysterious voice",
            "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
            "channel": ("#" + localZone.props.channel),
            "text": (localCharacter.props.name + ' has entered ' + localZone.props.name)
        };

        return travelAlertDetails;
    }

    characterProfile(requestSlackUserID){

        //Pass in the slack user id making the call.  The constructor will set the DB user ID based on slack user
        var localUser = new User(this.state, requestSlackUserID);

        //Get the local character's id
        var characterID = localUser.getCharacterID();

        var localCharacter = new Character(this.state, characterID);

        var template = {
            "attachments": [
            {

                "image_url": "https://scrum-wars.herokuapp.com/file/unknown_character.jpg",
                "fields": [
                ]
            },
            {
                "title": "Character Stats",
                "fields": [
                ]
            },
            {
                "fields": [

                ]
            }
        ]
        };

        //Array of stat keys
        var statKeys = Object.keys(localCharacter.props);

        template.attachments[0].image_url = "https://scrum-wars.herokuapp.com/assets/fullSize/" + localCharacter.props.class_id + ".jpg";

        //Iterate through the stat keys
        template.attachments[1].fields = statKeys.map( key =>{
            return {
                "title": key,
                "value": localCharacter.props[key],
                "short": true
            };
        });

        //Interactive portion of profile menu
        template.attachments[2] = {

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
            }]
        };

        console.log('Final template: ', JSON.stringify(template));

        return(template);
    }

    characterName(requestSlackUserID, slackTextInput){

        //Pass in the slack user id making the call.  The constructor will set the DB user ID based on slack user
        var localUser = new User(this.state, requestSlackUserID);

        //Get the local character's id
        var characterID = localUser.getCharacterID();

        //Object containing all character IDs in the game
        var characters = this.state.character;

        //Create a local character object
        var localCharacter = new Character(this.state, characterID);

        //Attempt to find a character.  If this returns undefined, name does not exist
        if(_.findKey(characters, {'name': slackTextInput})){

            console.log('character name taken');

            //Return character taken template
            return slackTemplates.characterNameTaken;

        } else {

            console.log('character name NOT taken (returned undefined)');

            //Update the characters name property locally
            localCharacter.updateProperty('name', slackTextInput);

            //Return character taken template
            var characterNameAcceptedTemplate = slackTemplates.characterNameAccepted;

            //Add the inputted name into the template before returning
            characterNameAcceptedTemplate.attachments[0].text = (characterNameAcceptedTemplate.attachments[0].text + slackTextInput);

            return characterNameAcceptedTemplate

        }
    }

    getAvailableActions(requestSlackUserID, requestSlackChannelID){

        //Pass in the slack user id making the call.  The constructor will set the DB user ID based on slack user
        var localUser = new User(this.state, requestSlackUserID);

        //Get the local character's id
        var characterID = localUser.getCharacterID();

        var localCharacter = new Character(this.state, characterID);

        var localZone = new Zone(this.state, requestSlackChannelID);

        //Determine if the zone where /action was called matches the character's location - if mismatch, return travel template
        if (localCharacter.props.zone_id !== localZone.id) {

            //Return mismatch template by passing in zone ids
            return moveCharacter(localZone.id, localZone.props.name);
        }

        //Create match locally for reference
        var match = new Match(this.state, this.getCurrentMatchID());

        //Look through all player's actions and determine if any were used in the current turn.
        //Use lodash .find which returns the first occurance of the search parameter.  If it returns any actions that were used on the current turn, then player has no actions available
        if(_.find(localCharacter.props.actions, {'turn_used': match.props.number_turns})) {

            return slackTemplates.actionAlreadyTaken;
        }

        var characterActionsAvailableInCurrentZone = [];

        //Take an array of the character's actions and filter it for actions that can be used in the current zone
        localCharacter.props.actions.forEach( characterAction =>{

            var localAction = new Action(this.state, characterAction.action_id);

            if (_.indexOf(localAction.props.zone_id, localZone.id) > -1) {
                characterActionsAvailableInCurrentZone.push(localAction)
            }
        });

        var groupedActions = _(characterActionsAvailableInCurrentZone).groupBy((singleAction) => {

            return singleAction.props.type;
        });

        try {

            //Iterate through the grouped actions
            var templateAttachments = groupedActions.map(actionCategory => {

                var actionType = actionCategory[0].props.type;

                //Build the major template
                var attachmentTemplate = {
                    "title": actionType,
                    "fallback": "You are unable to choose an action",
                    //TODO need to determine format of callback_id, this will likely need to be passed into the Game method call
                    //"callback_id": "/action",
                    "color": "#3AA3E3", //TODO change to attack oriented color
                    "attachment_type": "default",
                    //TODO add tiny_url for attack symbol
                    "actions": []
                };

                actionCategory.forEach(actionDetails => {

                    var singleAction = _.find(localCharacter.props.actions, {'action_id': actionDetails.id});

                    var actionAvailability = actionDetails.getActionAvailability(singleAction.turn_available, match.props.number_turns);

                    //Default button color to red ("danger").  If available, it will be overwritten
                    var actionAvailableButtonColor = "danger";

                    //If the button is available based on the match turn, overwrite the color to green
                    if (actionAvailability) {
                        actionAvailableButtonColor = "primary"
                    }

                    //Push each action into the actions array portion of the template
                    attachmentTemplate.actions.push({
                        "name": actionDetails.props.name,
                        "text": actionDetails.props.name,
                        "style": actionAvailableButtonColor,
                        "type": "button",
                        "value": actionDetails.props.name
                    })
                });

                return attachmentTemplate;
            });

        } catch(err){
            console.log('Error when mapping template attachments: ', err)
        }

        //Get the basic action template from the JSON file
        var finalTemplate = slackTemplates.actionMenu;

        console.log('templateAttachments: ', templateAttachments);

        console.log('array length: ', templateAttachments.length);

        console.log('templateAttachments is array? : ', Array.isArray(templateAttachments));

        //Add the actions template into the slack template to return
        finalTemplate.attachments = templateAttachments;

        console.log('finalTemplate.attachments is array? : ', Array.isArray(finalTemplate.attachments));

        return finalTemplate;
    }
    
    shopList(requestSlackChannelID){

        console.log('called shopList, ', requestSlackChannelID);

        //Use the channel to create a local zone
        var localZone = new Zone(this.state, requestSlackChannelID);

        console.log('merchants: ', this.state.merchant);

        //Look at state and determine which merchant is in the zone
        var merchantID = _.findKey(this.state.merchant, singleMerchant => {
            {return singleMerchant['zone_id'] === localZone.id}
        });

        console.log('shopList merchant id: ', merchantID);

        var localMerchant = new Merchant(this.state, merchantID);

        var itemsForSaleArray = localMerchant.getItemsForSale();

        var slackTemplateDropdown = itemsForSaleArray.map( itemID =>{
            var localItem = this.state.item[itemID];

            return {
                "text": localItem.name,
                "value": localItem.name
            }
        });

        var slackTemplate = slackTemplates.shopMenu;

        slackTemplate.attachments[0].actions[0].options = slackTemplateDropdown;

        return slackTemplate
        
    }
}




module.exports = {
    Game: Game
};

