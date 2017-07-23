'use strict';

var Firebase = require('../libraries/firebase').Firebase;
var firebase = new Firebase();



var User = require('./User').User;
var Character = require('./Character').Character;
var Zone = require('./Zone').Zone;
var Match = require('./Match').Match;
var Merchant = require('./Merchant').Merchant;
var Action = require('./Action').Action;
var Item = require('./Item').Item;
var EquipmentSlot = require('./EquipmentSlot').EquipmentSlot;
var slackTemplates = require('../slackTemplates');

var moveCharacter = require('../components/zone/moveCharacter').moveCharacter;
var _ = require('lodash');

//TODO - move this to a config file
var emptyItemID = '-Kjk3sGUJy5Nu8GWsdff';



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
    
    createCharacter(userID){
        
        function randomGenerator() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        
        var localRandomID = (randomGenerator() + randomGenerator() + randomGenerator() + randomGenerator() + randomGenerator()).toLowerCase();

        var currentCharacters = this.state.character;

        var newChar = {
            [localRandomID]: {
                active: 1,
                name: 'Unknown Traveler',
                user_id: userID,
                gold: 100,
                armor: 0,
                hit_points: 100,
                max_hit_points: 100,
                match_wins: 0,
                zone_id: '-Khu9Zazk5XdFX9fD2Y8',
                inventory: {
                    equipped: {
                        hand_1: "-Kjk3sGUJy5Nu8GWsdff"
                    },
                    unequipped: [
                        "-Kjk3sGUJy5Nu8GWsdff"
                    ]
                }
            }
        };

        //Mutate the object
        Object.assign(currentCharacters, newChar);
        
        return localRandomID;
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
                "name": "Inventory",
                "text": "Inventory",
                "style": "default",
                "type": "button",
                "value": "Inventory"
            },
            {
                "name": "Equipment",
                "text": "Equipped Items",
                "style": "default",
                "type": "button",
                "value": "Equipment"
            }]
        };

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

        console.log('called getAvailableActions');

        //Pass in the slack user id making the call.  The constructor will set the DB user ID based on slack user
        var localUser = new User(this.state, requestSlackUserID);

        //Get the local character's id
        var characterID = localUser.getCharacterID();

        var localCharacter = new Character(this.state, characterID);

        var localZone = new Zone(this.state, requestSlackChannelID);

        //Determine if the zone where /action was called matches the character's location - if mismatch, return travel template
        /* Moved this logic to slackRequest
        if (localCharacter.props.zone_id !== localZone.id) {

            //Return mismatch template by passing in zone ids
            return moveCharacter(localZone.id, localZone.props.name);
        }*/

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

            console.log('characterAction: ', characterAction);

            var localAction = new Action(this.state, characterAction);

            console.log('localAction.props.zone_id: ', localAction.props);

            if (_.indexOf(localAction.props.zone_id, localZone.id) > -1) {
                characterActionsAvailableInCurrentZone.push(localAction)
            }
        });

        var groupedActions = _(characterActionsAvailableInCurrentZone).groupBy((singleAction) => {

            return singleAction.props.type;
        });

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

            console.log('actionCategory: ', JSON.stringify(actionCategory));

            actionCategory.forEach(actionDetails => {

                console.log('each actionDetails: ', actionDetails);

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

        //Get the basic action template from the JSON file
        var finalTemplate = slackTemplates.actionMenu;

        //Add the actions template into the slack template to return
        //Use .value() to unwrap the lodash wrapper
        finalTemplate.attachments = templateAttachments.value();

        return finalTemplate;
    }

    getCharacterClasses() {

        var characterClassesTemplate = slackTemplates.generateCharacterClassList;
        
        //Get all available classes from local
        var localCharacterClasses = this.state.class;

        //Get an array of all class IDs
        var classIDs = Object.keys(localCharacterClasses);

        //template.attachments = classNames.map( className =>{
        characterClassesTemplate.attachments = classIDs.map( singleClassID =>{

            //Get the name for the class ID
            var className = localCharacterClasses[singleClassID].name;

            return {

                "title": className,
                "fallback": "You are unable to choose an action",
                "callback_id": "characterSelectionClass",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "image_url": "https://scrum-wars.herokuapp.com/assets/fullSize/" + singleClassID + ".jpg",
                "actions": [{
                    "name": singleClassID,
                    "text": className,
                    "style": "default",
                    "type": "button",
                    "value": singleClassID
                }]
            }
        });

        return characterClassesTemplate;

    }
    
    shopList(requestSlackChannelID){

        //Use the channel to create a local zone
        var localZone = new Zone(this.state, requestSlackChannelID);

        //Look at state and determine which merchant is in the zone
        var merchantID = _.findKey(this.state.merchant, singleMerchant => {
            {return singleMerchant['zone_id'] === localZone.id}
        });

        var localMerchant = new Merchant(this.state, merchantID);

        var itemsForSaleArray = localMerchant.getItemsForSale();

        var slackTemplateDropdown = itemsForSaleArray.map( itemID =>{
            var localItem = this.state.item[itemID];

            return {
                "text": localItem.name,
                "value": itemID
            }
        });

        var slackTemplate = slackTemplates.shopMenu;

        //Add the corresponding merchant's image
        slackTemplate.attachments[0].image_url = "https://scrum-wars.herokuapp.com/assets/fullSize/" + localMerchant.id + ".jpg";
        
        slackTemplate.attachments[1].actions[0].options = slackTemplateDropdown;

        return slackTemplate
        
    }
    
    //Arguments: array of item IDs
    getItemList(itemArray){

        //Validate that array was passed
        //if (typeof(itemArray) === array)
        
        //var responseTemplate = slackTemplates.itemList;

        return itemArray.map( eachInventoryItemID =>{

            //Create a local item
            var localItem = new Item(this.state, eachInventoryItemID);
            
            return {
                "text": localItem.props.name,
                "value": localItem.id
            }
        })
    }

    getEquipmentList(equipmentIDArray){

        //DB has an equipment_slots array
        var equipmentSlots = this.state.equipment_slot;

        //console.log('equipmentSlots: ', JSON.stringify(equipmentSlots));

        var slotKeys = Object.keys(equipmentSlots);

        //For each equipment slot determine what item the player has in that slot and return
        return slotKeys.map( eachEquipmentSlotID=>{

            var eachEquipmentSlot = equipmentSlots[eachEquipmentSlotID];

            //console.log('eachEquipmentSlot: ', eachEquipmentSlot);

            //Declare a local equipment slot
            var localEquipmentSlot = new EquipmentSlot(this.state, eachEquipmentSlotID);

            //console.log('localEquipmentSlot id: ', localEquipmentSlot.id);
            //default, will get overwritten
            var itemInSlot = undefined;

            //Iterate through equipmentList to determine if there is an equipped item in that slot
             equipmentIDArray.forEach( eachEquipmentID =>{

                //console.log('eachEquipmentID: ', eachEquipmentID);

                //Create a local item
                var localItem = new Item(this.state, eachEquipmentID);

                //console.log('localItem: ', localItem);

                //console.log('localItem props: ', localItem.props.equipment_slots);

                //console.log('localEquipmentSlotid: ', localEquipmentSlot.id);


                 var itemIndex = localItem.props.equipment_slots.indexOf(localEquipmentSlot.id);

                 if (itemIndex >= 0) {
                     itemInSlot = localItem
                 }
            });

            //If no item in slot (undefined), set the item to the "empty" item
            if (typeof itemInSlot == 'undefined') {
                itemInSlot = new Item(this.state, emptyItemID);
            }

            //console.log('itemInSlot: ', itemInSlot);
            
            var baseTemplate = {
                "title": localEquipmentSlot.props.name,
                "callback_id": "equipmentMenu",
                "thumb_url": "https://scrum-wars.herokuapp.com/assets/thumb/" + itemInSlot.id + ".jpg",
                "fields": [{
                    "title": "Equipment name",
                    "value": itemInSlot.props.name,
                    "short": false
                }],
                "actions": []
            };

            console.log('itemInSlot.id: ', itemInSlot.id);
            console.log('emptyItemID: ', emptyItemID);

            //If the item is any ID other than the "empty" item, add an inspect button
            if (itemInSlot.id != emptyItemID) {

                console.log('Passed conditional pushing to baseTemplate.action: ', JSON.stringify(baseTemplate.actions));

                baseTemplate.actions.push({
                    "name": "inspect",
                    "text": "Inspect item",
                    "style": "default",
                    "type": "button",
                    "value": itemInSlot.id
                })
            }

            return baseTemplate
        });
    }
    
}




module.exports = {
    Game: Game
};

