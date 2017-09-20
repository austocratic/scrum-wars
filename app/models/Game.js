'use strict';

var Firebase = require('../libraries/firebase').Firebase;
var firebase = new Firebase();

var User = require('./User').User;
var Character = require('./Character').Character;
var Class = require('./Class').Class;
var Zone = require('./Zone').Zone;
var Match = require('./Match').Match;
var NPC = require('./NPC').NPC;
var Action = require('./Action').Action;
var Item = require('./Item').Item;
var EquipmentSlot = require('./EquipmentSlot').EquipmentSlot;
var slackTemplates = require('../slackTemplates');

var slackAlert = require('../libraries/slack').Alert;

var moveCharacter = require('../components/zone/moveCharacter').moveCharacter;
var _ = require('lodash');

var helpers = require('../helpers');
var gameConfigurations = require('./gameConfigurations.json');

//TODO - move this to a config file
var emptyItemID = '-Kjk3sGUJy5Nu8GWsdff';



class Game {
    constructor() {
        
        this.maleAvatarPaths = [];
        this.femaleAvatarPaths = [];

        helpers.getFilePaths("public/images/fullSize/character_avatar/male", this.maleAvatarPaths);
        helpers.getFilePaths("public/images/fullSize/character_avatar/female", this.femaleAvatarPaths);

        //Was going to use a helper to append file path to URL, but these were never getting reset
        //helpers.getImageFilePaths("app/assets/fullSize/character_avatar/male", this.maleAvatarPaths);
        //helpers.getImageFilePaths("app/assets/fullSize/character_avatar/female", this.femaleAvatarPaths);
    }
    
    //Get state of the game from DB
    async getState(){
        this.state = await firebase.get();
    }

    //Push local state to the DB
    async updateState(){
        return await firebase.update('', this.state)
    }

    //TODO should probably move this to a game helper file
    randomGenerator() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }

    /*TODO DELETE AFTER TESTING
    getCurrentMatch(){


        return this.state.match_id
    }*/
    
    //Refresh function checks the game's state looking for certain conditions (player deaths, ect.)
    //It is invoked periodically by cron
    //It is always invoked after a player action
    //TODO I should probably make a gameController file and move this (and other functions) into it
    refresh(){

        //console.log('DEBUG: this.state(): ', this.state);

        console.log('DEBUG: this.getCurrentMatchID(): ', this.getCurrentMatchID());

        //**********************~~  Match  ~~***********************

        //Read game state to find the current match ID
        let currentMatch = new Match(this.state, this.getCurrentMatchID());

        console.log('DEBUG: currentMatch.props: ', currentMatch.props);
        
        //Read the match status & determine needed update
        switch(currentMatch.props.status){

            //If match is pending, determine if a match starting alert should be sent
            case 'pending':
                console.log('DEBUG: called game.refresh() currentMatch.props.status = pending');

                let currentDate = new Date();

                let currentHour = currentDate.getUTCHours();

                //Look at the current time.  Compare current time to config property of match start time
                console.log('DEBUG: Current hour: ', currentHour);
                
                console.log('gameConfiguration match start: ', gameConfigurations.match.startTime);

                //Determine if the pending match should begin
                if (currentHour > gameConfigurations.match.startTime){
                    console.log('Time to start the match!');

                    //Start the match - change status to started
                    currentMatch.start();

                    var alertDetails = {
                        "username": "A mysterious voice",
                        "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                        //TODO dont hardcode the arena
                        "channel": ("#arena"),
                        "text": "Prepare for battle! A new turn turn has arrived!"
                    };

                    let matchStartAlert = new slackAlert(alertDetails);

                    matchStartAlert.sendToSlack(this.props)
                }

                break;
            
            //If match has started, determine if turn should be incremented, determine if game has hit end condition
            case 'started':
                console.log('DEBUG: called game.refresh() currentMatch.props.status = started');

                let matchStartingCharacterIDs = currentMatch.getStartingCharacterIDs();

                //If no characters in the zone, end the match
                if (matchStartingCharacterIDs.length === 0) {
                    currentMatch.end()
                }

                let characterIDinZone = matchStartingCharacterIDs
                    //Filter starting characters for characters currently in the zone
                    .filter( eachMatchStartingCharacterID =>{
                        return this.state.character[eachMatchStartingCharacterID].zone_id === currentMatch.props.zone_id
                    });
                
                if (characterIDinZone.length === 1) {
                    
                    //Create a winning character object reference
                    let winningCharacter = new Character(this.state, characterIDinZone[0]);
                    
                    //Notify Slack about the winner
                    
                    //Increment that players win count
                    winningCharacter.incrementProperty('arena_wins', 1);
                    
                    //Reward the winning character
                    //TODO come up with randomization function for arena gold reward
                    let arenaReward = 10;

                    //Increment that players win count
                    winningCharacter.incrementProperty('gold', arenaReward);
                    
                    currentMatch.end()
                }
                
                break;
            
            //If match has ended, create a new match and update the global match ID
            case 'ended':
                console.log('DEBUG: called game.refresh() currentMatch.props.status = ended');

                //Pass in old match zone when creating the new match
                let newMatchID = this.createMatch(currentMatch.props.zoneID);

                //Update the global state to new match id
                this.state.global_state.match_id = newMatchID;
                
                break;
        }
        


        //Check for dead characters
            //If dead character, remove them from the arena

       //Check for only a single character in the arena after it has begun
            //Announce character as the winner
            //Increment that character's win total
            //Heal
        

    }
    
    //Set properties in memory
    inititateRequest(){
        
        try {
            var characterKeys = Object.keys(this.state.character);

            //console.log('characterKeys: ', characterKeys);

            var localCharacter;
            
            //Iterate through each character's effects setting the modified properties
            characterKeys.forEach(eachCharacterKey => {
                //console.log('eachCharacter.active: ', this.state.character[eachCharacterKey].active);

                //Character must be active to set modified properties
                if (this.state.character[eachCharacterKey].active === 1) {
                    localCharacter = new Character(this.state, eachCharacterKey);

                    var cumulativeModifiers = {};

                    //console.log('localCharacter.props: ', localCharacter.props);

                    //TODO hard coded 5 for matchTurn for unit test dev
                    if (localCharacter.props.effects){

                        //console.log('passed localCharacter.props.effects check')

                        let filterFunction = eachEffect => {
                            return eachEffect.end_turn > 5; //Match turn
                        };

                        let cumulativeEffects = localCharacter.getCumulativeModifiers('effects', filterFunction);

                        localCharacter.accumulateProperties(cumulativeModifiers, cumulativeEffects);
                    }

                    if (localCharacter.props.inventory){

                        let filterFunction = eachEffect => {
                            return eachEffect.is_equipped === 1
                        };

                        let cumulativeInventory = localCharacter.getCumulativeModifiers('inventory', filterFunction);

                        localCharacter.accumulateProperties(cumulativeModifiers, cumulativeInventory);
                    }

                    //Take modifiers object and set modified stats.  setModifiedStats takes the character's base stat and adds the modifier before updating
                    localCharacter.setModifiedStats(cumulativeModifiers);

                    //console.log('modified_strength after modifications: ', localCharacter.props.modified_strength);
                }
            });
            //for each character iterate through each

            return 5;
        } catch(err){
    
        console.log('error in initiate(): ', err);
    }


    }

    createMatch(zoneID){

        var localRandomID = (this.randomGenerator() + this.randomGenerator() + this.randomGenerator() + this.randomGenerator() + this.randomGenerator()).toLowerCase();

        let currentMatches = this.state.match;

        let newMatch = {
            [localRandomID]: {
                active: 0,
                turn: 0,
                starting_character_ids : [],
                zone_id : zoneID
            }
        };

        //Mutate the object
        Object.assign(currentMatches, newMatch);

        return localRandomID;
    }

    createCharacter(userID){
        
        var localRandomID = (this.randomGenerator() + this.randomGenerator() + this.randomGenerator() + this.randomGenerator() + this.randomGenerator()).toLowerCase();

        var currentCharacters = this.state.character;

        var newChar = {
            [localRandomID]: {
                active: 1,
                name: 'Unknown Traveler',
                level: 1,
                user_id: userID,
                gold: 100,
                armor: 0,
                is_hidden: 0,
                hit_points: 100,
                max_hit_points: 100,
                match_wins: 0,
                zone_id: '-Khu9Zazk5XdFX9fD2Y8'
            }
        };

        //Mutate the object
        Object.assign(currentCharacters, newChar);
        
        return localRandomID;
    }
    
    getCurrentMatchID(){

        console.log('DEBUG: called getCurrentMatchID');

        console.log('DEBUG: this.state.global_state: ', this.state.global_state);

        return this.state.global_state.match_id

    }


    /*
    characterProfile(requestSlackUserID){

        //Pass in the slack user id making the call.  The constructor will set the DB user ID based on slack user
        var localUser = new User(this.state, requestSlackUserID);

        //Get the local character's id
        var characterID = localUser.getCharacterID();

        var localCharacter = new Character(this.state, characterID);

        var localClass = new Class(this.state, localCharacter.props.class_id);

        var template = {
            "attachments": [
            {
                "title": localCharacter.props.name + "'s Profile",
                "image_url": "https://scrum-wars.herokuapp.com/file/unknown_character.jpg",
                "fields": [
                ]
            },
            {
                "fields": [
                ]
            },
            {
                "fields": [

                ]
            }
        ]
        };

        template.attachments[0].image_url = "https://scrum-wars.herokuapp.com/" + localCharacter.props.avatar;

        template.attachments[1].fields = [
            {
                "title": "Class",
                "value": localClass.props.name,
                "short": false
            },
            {
                "title": "Gold",
                "value": localCharacter.props.gold,
                "short": false
            },
            {
                "title": "Current Health",
                "value": localCharacter.props.hit_points,
                "short": true
            },
            {
                "title": "Max Health",
                "value": localCharacter.props.max_hit_points,
                "short": true
            },
            {
                "title": "Strength",
                "value": localCharacter.props.modified_strength,
                "short": true
            },
            {
                "title": "Intelligence",
                "value": localCharacter.props.modified_intelligence,
                "short": true
            },
            {
                "title": "Dexterity",
                "value": localCharacter.props.modified_dexterity,
                "short": true
            },
            {
                "title": "Toughness",
                "value": localCharacter.props.modified_toughness,
                "short": true
            },
            {
                "title": "Armor",
                "value": localCharacter.props.armor,
                "short": true
            }

        ];

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
            },
            {
                "name": "Exit",
                "text": "Exit",
                "style": "default",
                "type": "button",
                "value": "Exit"
            }]
        };

        return(template);
    }*/

    /*
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
    }*/

    getAvailableActions(requestSlackUserID, requestSlackChannelID){

        //Pass in the slack user id making the call.  The constructor will set the DB user ID based on slack user
        var localUser = new User(this.state, requestSlackUserID);

        var characterID = localUser.getCharacterID();

        var localCharacter = new Character(this.state, characterID);
        var localZone = new Zone(this.state, requestSlackChannelID);
        var localMatch = new Match(this.state, this.getCurrentMatchID());

        //Returns an array of all the character's action IDs with is_active = 1
        var actionIDsAvailable = localCharacter.getActionIDs();

        //Determine if any action was already taken this turn, if so return the action taken template
        //var actionsUsedThisTurn = localCharacter.getActionsUsedOnTurn(localMatch.props.number_turns);

        //If character already took an action this turn return the no action available template
        /* TODO commented out check for if action is already taken to make testing easier
        if (actionsUsedThisTurn.length > 0) {
            return slackTemplates.actionAlreadyTaken;
        }*/

        //Use action IDs to make an array of action objects
        var actionObjectsAvailable = actionIDsAvailable.map( eachActionID =>{
            return new Action(this.state, eachActionID);
        });

        //Filter the action object array for actions available in the current zone
        var actionsAvailableInZone = actionObjectsAvailable.filter( eachActionObject =>{
            return _.indexOf(eachActionObject.props.zone_id, localZone.id) > -1;
        });

        //Group the actions for slack
        var groupedActions = _(actionsAvailableInZone).groupBy((singleAction) => {
            return singleAction.props.type;
        });
        
        //Iterate through the grouped actions
        var templateAttachments = groupedActions.map(actionCategory => {

            var actionType = actionCategory[0].props.type;

            //Build the template
            var attachmentTemplate = {
                "title": actionType,
                "fallback": "You are unable to choose an action",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": []
            };

            actionCategory.forEach(actionDetails => {

                //Default button color to red ("danger").  If available, it will be overwritten
                var actionAvailableButtonColor = "danger";

                //If the button is available based on the match turn, overwrite the color to green
                if (localCharacter.isActionAvailable(actionDetails.id, localMatch.props.number_turns)) {
                    actionAvailableButtonColor = "primary"
                }

                //Push each action into the actions array portion of the template
                attachmentTemplate.actions.push({
                    "name": actionDetails.id,
                    "text": actionDetails.props.name,
                    "style": actionAvailableButtonColor,
                    "type": "button",
                    "value": actionDetails.id
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
        
        characterClassesTemplate.attachments = classIDs.map( singleClassID =>{

            return {

                "title": localCharacterClasses[singleClassID].name,
                "fallback": "You are unable to choose an action",
                "callback_id": "",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "image_url": "https://scrum-wars.herokuapp.com/assets/fullSize/" + singleClassID + ".jpg",
                "actions": [{
                    "name": singleClassID,
                    "text": localCharacterClasses[singleClassID].name,
                    "style": "default",
                    "type": "button",
                    "value": singleClassID
                }]
            }
        });
        
        return characterClassesTemplate;
    }

    getCharacterIDsInZone(zoneID){
        console.log('called getCharacterIDsInZone');


        //Set a variable for all character IDs in zone (active & inactive & all zones)
        var characterIDsInZone = Object.keys(this.state.character);

        //Filter for Active characters && current zone (returns character IDs) && not hidden
        return characterIDsInZone.filter( singleCharacterID =>{
            return (this.state.character[singleCharacterID].active === 1 && this.state.character[singleCharacterID].zone_id === zoneID && this.state.character[singleCharacterID].is_hidden === 0)
        });
    }

    getCharactersInZone(zoneID, requestSlackUserID){
        console.log('called getCharactersInZone');

        //Pass in the slack user id making the call.  The constructor will set the DB user ID based on slack user
        var localUser = new User(this.state, requestSlackUserID);

        //Get the local character's id
        var characterID = localUser.getCharacterID();

        var localCharacter = new Character(this.state, characterID);

        var slackTemplate = slackTemplates.characterList;
        
        var characterIDs = this.getCharacterIDsInZone(zoneID);

        console.log('getCharactersInZone characterIDs: ', characterIDs);

        //Filter out the player's character
        var filteredCharacterIDs = _.remove(characterIDs, eachCharacterID =>{
            //If a character ID is not equal to the player's character ID, it stays (remove player's character)
            return eachCharacterID !== localCharacter.id
        });

        console.log('getCharactersInZone filteredCharacterIDs: ', filteredCharacterIDs);

        //Iterate through the character Ids formatting into slack format
        filteredCharacterIDs.forEach(singleCharacterID => {
            slackTemplate.attachments[0].actions[0].options.push({
                //"name": singleCharacterID,
                "text": this.state.character[singleCharacterID].name,
                //"style": "primary",
                //"type": "button",
                "value": singleCharacterID
            });
        });

        return slackTemplate;
    }
    
    /* TODO moved this functionality into shop action, verify before deleting
    shopList(requestSlackChannelID){

        //Use the channel to create a local zone
        var localZone = new Zone(this.state, requestSlackChannelID);

        var npcID = _.findKey(this.state.npc, singleNPC => {
            {return singleNPC['zone_id'] === localZone.id}
        });

        var localNPC = new NPC(this.state, npcID);

        var itemsForSaleArray = localNPC.getItemsForSale();

        /*
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
        slackTemplate.attachments[0].image_url = "https://scrum-wars.herokuapp.com/assets/fullSize/" + localNPC.id + ".jpg";
        
        slackTemplate.attachments[1].actions[0].options = slackTemplateDropdown;

        return slackTemplate
        
    }*/

    getEquippedItemView(localCharacter){

        //get array of all available equipment slot keys (IDs)
        let equipmentSlotKeys = Object.keys(this.state.equipment_slot);

        let singleEquipmentSlot;

        //Iterate through all the standard inventory slots to create a template with an attachment for each slot
        return equipmentSlotKeys.map( eachEquipmentSlot =>{
            
            singleEquipmentSlot = new EquipmentSlot(this.state, eachEquipmentSlot);

            let equippedSlotItem = localCharacter.getEquipmentInSlot(singleEquipmentSlot.id);

            console.log('DEBUG getEquipmentInSlot: ', equippedSlotItem);
            
            //Default to empty slot format, if not empty, over write it
            let formattedSlot = {
                item_id: '-Kjk3sGUJy5Nu8GWsdff',
                name: 'Empty'
            };
            
            if (equippedSlotItem.length > 0){
                formattedSlot = {
                    item_id: equippedSlotItem[0].item_id,
                    name: equippedSlotItem[0].name
                }
            }
            
            let baseTemplate = {
                "title": singleEquipmentSlot.props.name,
                "callback_id": "",
                "fallback": "You are unable select that item",
                "thumb_url": "https://scrum-wars.herokuapp.com/assets/thumb/" + formattedSlot.item_id + ".jpg",
                "fields": [{
                    "title": formattedSlot.name,
                    "value": "",
                    "short": false
                }],
                "actions": []
            };
            
            //If the item is any ID other than the "empty" item, add an inspect button
            if (equippedSlotItem.length > 0){

                baseTemplate.actions.push({
                    "name": "equipmentSelection",
                    "text": "Inspect item",
                    "style": "default",
                    "type": "button",
                    "value": formattedSlot.item_id
                })
            }
            
            return baseTemplate;
        });
    }

    getPaginatedAttachment(listToPaginate, firstKey, lastKey){
        
        let truncFileList = listToPaginate.slice(firstKey, lastKey);

        return truncFileList.map( eachFilePath =>{
            console.log('eachFilePath: ', eachFilePath);
            return {
                "text": "",
                "image_url": eachFilePath
            }
        });
    }
}




module.exports = {
    Game: Game
};

