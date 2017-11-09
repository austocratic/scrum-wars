'use strict';

const fs = require('fs');

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
//var slackTemplates = require('../slackTemplates');

var slackAlert = require('../libraries/slack').Alert;
const slack = require('../libraries/slack').sendMessage;

var _ = require('lodash');

var helpers = require('../helpers');
var gameConfigurations = require('./gameConfigurations.json');

//TODO - move this to a config file
var emptyItemID = '-Kjk3sGUJy5Nu8GWsdff';

const getActionEffectController = require('../controllers/actionEffectController').getActionEffectController;



class Game {
    constructor() {
        
        //this.maleAvatarPaths = [];
        //this.femaleAvatarPaths = [];

        //helpers.getFilePaths("public/images/fullSize/character_avatar/male", this.maleAvatarPaths);
        //helpers.getFilePaths("public/images/fullSize/character_avatar/female", this.femaleAvatarPaths);
        
        //var fs = fs || require('fs');
        
        this.baseURL = 'https://scrum-wars.herokuapp.com/';
        
        this.avatarPath = 'public/images/fullSize/character_avatar/';
        this.skillImagePath = 'public/images/thumb/';
        
        this.maleAvatarFileNames = fs.readdirSync(this.avatarPath + 'male');
        this.femaleAvatarFileNames = fs.readdirSync(this.avatarPath + 'female');
        
        //Configuration: # of minutes per turn
        this.turnLengthMinutes = 60
        
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
    
    //Checks the game's state looking for certain conditions (player deaths, ect.)
    //It is invoked periodically by cron
    //It is always invoked after a player action
    refresh(){
        console.log('called Game.refresh()');
        
        //**********************~~  Match  ~~***********************

        //Read game state to find the current match ID
        let currentMatch = new Match(this.state, this.getCurrentMatchID());

        //Read the match status & determine needed update
        switch(currentMatch.props.status){

            //If match is pending, determine if a match starting alert should be sent
            case 'pending':
                console.log('Called game.refresh() currentMatch.props.status = pending');

                let currentDate = new Date();

                let currentHour = currentDate.getUTCHours();

                //Look at the current time.  Compare current time to config property of match start time
                //console.log('DEBUG: Current hour: ', currentHour);
                
                //console.log('gameConfiguration match start: ', gameConfigurations.match.startTime);

            //*************** CHECK FOR MATCH START *****************
                if (currentHour > gameConfigurations.match.startTime){
                    console.log('Time to start the match!');

                    //TODO get all the characters currently in the zone

                    //Start the match: set status, starting characters, start date
                    //Pass in an array of character IDs to set as starting characters.  These should be characters in the zone when the match starts

                    console.log('DEBUG Game.refresh currentMatch.props.zone_id: ', currentMatch.props.zone_id);

                    console.log('DEBUG this.getCharacterIDsInZone(currentMatch.props.zone_id): ', this.getCharacterIDsInZone(currentMatch.props.zone_id));

                    currentMatch.start(this.getCharacterIDsInZone(currentMatch.props.zone_id));

                    let alertDetails = {
                        "username": "A mysterious voice",
                        "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                        //TODO dont hardcode the arena
                        "channel": ("#arena"),
                        "text": "Prepare for battle! The match begins!"
                    };

                    slack(alertDetails);

                    //let matchStartAlert = new slackAlert(alertDetails);
                    //matchStartAlert.sendToSlack(this.props)
                }

                break;
            
            //If match has started, determine if turn should be incremented or determine if game has hit end condition
            case 'started':
                console.log('Called game.refresh() currentMatch.props.status = started');

                let matchStartingCharacterIDs = currentMatch.getStartingCharacterIDs();

                //If no characters in the zone, end the match
                if (matchStartingCharacterIDs.length === 0) {
                    currentMatch.end()
                }

            //*************** PROCESS ONGOING EFFECTS *****************

                let charactersInZone = matchStartingCharacterIDs
                    .map( eachMatchStartingCharacterID =>{
                        return new Character(this.state, eachMatchStartingCharacterID);
                    })
                    //Filter starting characters for characters currently in the zone
                    .filter( eachMatchStartingCharacter =>{
                        return eachMatchStartingCharacter.props.zone_id === currentMatch.props.zone_id;
                    });

                //For each character in the zone lookup IDs of all effects
                charactersInZone.forEach( eachCharacter => {

                    //If the character has effects on them, process them
                    if( eachCharacter.props.effects ) {
                        eachCharacter.props.effects.forEach( eachEffect => {

                            let effectAction = new Action(this.state, eachEffect.action_id);

                            //Get the character who applied the effect.
                            //TODO should effects only work if the character who applied it is still alive?
                            let playerCharacter = new Character(this.state, eachEffect.applied_by_character_id);

                            //If the action has ongoing effects, process them
                            if (effectAction.props.ongoing_effects){
                                effectAction.props.ongoing_effects.forEach( eachOngoingEffect =>{

                                    console.log('DEBUG it is number_turns: ', currentMatch.props.number_turns);
                                    console.log('DEBUG it is turn_applied: ', eachEffect.turn_applied);
                                    console.log('DEBUG activating function: ', eachOngoingEffect.functionName);
                                    console.log('DEBUG eachEffect: ', eachEffect);
                                    console.log('DEBUG eachEffect turn: ', eachEffect.turn_effect_processed[0]);
                                    console.log('DEBUG includes? ', eachEffect.turn_effect_processed.includes(currentMatch.props.number_turns - eachEffect.turn_applied));


                                    //Check if the action has an ongoing effect that should apply to the current turn.
                                    //In order to get the relative turn number take the current turn - the turn the action was applied
                                    if(eachOngoingEffect.active_on_turn.includes(currentMatch.props.number_turns - eachEffect.turn_applied) &&
                                        //Don't need the relative turn here
                                        !eachEffect.turn_effect_processed.includes(currentMatch.props.number_turns)
                                    ){
                                        console.log('DEBUG the effect SHOULD be applied this turn!  Activating it!');


                                        //Validate that the effect has not already been processed this turn





                                        //Declare the Class function without invoking, so I can then validate
                                        const actionEffectObjectToMake = getActionEffectController(eachOngoingEffect.functionName);

                                        //TODO how to access these objects like actionCharacter, currentZone, are they necessary?
                                        let gameObjects = {
                                            game: {
                                                baseURL: this.baseURL,
                                                avatarPath: this.avatarPath,
                                                skillImagePath: this.skillImagePath
                                            },
                                            targetCharacter: eachCharacter,
                                            //TODO for now the currentZone is hard coded.  In the future, refresh() should iterate through all zones and pass each into gameObjects
                                            requestZone: {
                                                props: {
                                                    channel : "arena",
                                                    channel_id : "C4Z7F8XMW",
                                                    name : "The Arena"
                                                }
                                            },
                                            playerCharacter
                                        };

                                        //Invoke validation function using the classes's attached validation properties before instantiating the class
                                        helpers.validateGameObjects(gameObjects, actionEffectObjectToMake.validations);

                                        let actionEffectObject = new actionEffectObjectToMake(gameObjects);

                                        actionEffectObject.initiate();

                                        //Mark that ongoing effect as used this turn, this prevents duplicate processing
                                        eachCharacter.updateEffectProcessed(effectAction.id, currentMatch.props.number_turns)
                                    }
                                })
                            }
                        })
                    }
                });

            //*************** CHECK FOR CHARACTER DEATHS *****************

                //Iterate through the characters in the zone and check if any are dead
                charactersInZone.forEach( eachCharacterInZone =>{

                    //If health has dropped below 0, character is dead
                    if(eachCharacterInZone.props.hit_points <= 0){

                        //Announce that character has been defeated
                        let characterDefeatedMessage = {
                            "username": "Arena Announcer",
                            "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                            //TODO dont hardcode the arena
                            "channel": ("#arena"),
                            "text": `The crowd cheers as ${eachCharacterInZone.props.name} is defeated!`
                        };

                        slack(characterDefeatedMessage);

                        //Move the character to the town
                        //TODO currently hard coding to the town square
                        eachCharacterInZone.updateProperty('zone_id', '-Khu9Zazk5XdFX9fD2Y8');
                    }
                });

            //*************** VICTORY CONDITIONS *****************

                //TODO currently a single refresh will not detect that players are dead and declare one as the winner
                //It will move dead characters in one refresh and declare the winner in the next refresh
                //Check for only one character left in zone (victory condition)
                if (charactersInZone.length === 1) {

                    //Last character Object is the winner.  Create reference for ease of use
                    let winningCharacter = charactersInZone[0];
                    //let winningCharacter = new Character(this.state, charactersInZone[0].id);

                    //Notify Slack about the winner
                    let alertDetails = {
                        "username": "Arena Announcer",
                        "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                        //TODO dont hardcode the arena
                        "channel": ("#arena"),
                        "text": `We have a winner!  Congratulations ${winningCharacter.props.name}`
                    };

                    slack(alertDetails);

                    //Increment that players win count
                    winningCharacter.incrementProperty('arena_wins', 1);

                    //Reward the winning character
                    //TODO come up with randomization function for arena gold reward
                    let arenaReward = 10;

                    //Increment that players win count
                    winningCharacter.incrementProperty('gold', arenaReward);

                    currentMatch.end(winningCharacter.id)
                }

            //*************** CHECK FOR TURN INCREMENT *****************

                console.log('currentMatch.props.date_started: ', currentMatch.props.date_started);

                //Calculate the time that the next turn should start:
                let nextTurnStartTime = (currentMatch.props.date_started + (currentMatch.props.number_turns * (this.turnLengthMinutes * 60000)));

                console.log('nextTurnStartTime: ', nextTurnStartTime);

                let humanTime = new Date(nextTurnStartTime);

                console.log('nextTurnStartTime: ', humanTime.toTimeString());

                console.log("Current time: ", Date.now());

                //Test if turn should be incremented
                if (Date.now() > nextTurnStartTime){
                    currentMatch.incrementProperty('number_turns', 1);
                }

                break;


            //If match has ended, create a new match and update the global match ID
            case 'ended':
                //Pass in old match zone when creating the new match
                let newMatchID = this.createMatch(currentMatch.props.zoneID);

                //Update the global state to new match id
                this.state.global_state.match_id = newMatchID;
                
                break;
        }
    }
    
    //Calculate properties in memory (I.E: ongoing effects, item effects, ect.)
    initiateRequest(){
        
        //Get all the characters in game
        let characterIDs = Object.keys(this.state.character);

        //Get an array character objects and process
        characterIDs
            .map( eachCharacterID =>{
                return new Character(this.state, eachCharacterID)
            })
            //Filter the character array for active characters only
            .filter( eachCharacterObject =>{
                return eachCharacterObject.props.active === 1
            })
            //Iterate through character objects setting their modified stats
            .forEach( eachActiveCharacterObject =>{

                let cumulativeModifiers = {};

                //If the character has effects, accumulate those effects in cumulativeModifiers
                if (eachActiveCharacterObject.props.effects){

                    eachActiveCharacterObject.props.effects
                        //Do I really need to filter with an "end turn"  Effects are active for as long as they are still character properties
                        //.filter( eachEffect => {
                        //    return eachEffect.end_turn > 5
                        //})
                        .forEach( eachFilteredEffect => {
                            if(eachFilteredEffect.modifiers){
                                eachActiveCharacterObject.accumulateProperties(cumulativeModifiers, eachFilteredEffect.modifiers);
                            }
                        });
                }

                //If the character has inventory items, accumulate those item's effects in cumulativeModifiers
                if (eachActiveCharacterObject.props.inventory){

                    eachActiveCharacterObject.props.inventory
                        //Filter for equipped items only
                        .filter( eachItem => {
                            return eachItem.is_equipped === 1
                        })
                        .forEach( eachFilteredItem => {
                            if(eachFilteredItem.modifiers){
                                eachActiveCharacterObject.accumulateProperties(cumulativeModifiers, eachFilteredItem.modifiers);
                            }
                        });
                }

                //Now apply the cumulative modifiers
                eachActiveCharacterObject.setModifiedStats(cumulativeModifiers);
            });
    }

    createMatch(zoneID){

        let localRandomID = (this.randomGenerator() + this.randomGenerator() + this.randomGenerator() + this.randomGenerator() + this.randomGenerator()).toLowerCase();

        let currentMatches = this.state.match;

        let newMatch = {
            [localRandomID]: {
                number_turns: 0,
                status: 'pending',
                starting_character_ids : [],
                zone_id : zoneID
            }
        };

        //Mutate the matches object to include the new match
        Object.assign(currentMatches, newMatch);

        return localRandomID;
    }

    createCharacter(userID){
        
        let localRandomID = (this.randomGenerator() + this.randomGenerator() + this.randomGenerator() + this.randomGenerator() + this.randomGenerator()).toLowerCase();

        let currentCharacters = this.state.character;

        let newChar = {
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
        return this.state.global_state.match_id
    }

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

        //Filter the action object array for actionControllers available in the current zone
        var actionsAvailableInZone = actionObjectsAvailable.filter( eachActionObject =>{
            return _.indexOf(eachActionObject.props.zone_id, localZone.id) > -1;
        });

        //Group the actionControllers for slack
        var groupedActions = _(actionsAvailableInZone).groupBy((singleAction) => {
            return singleAction.props.type;
        });
        
        //Iterate through the grouped actionControllers
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

                //Push each action into the actionControllers array portion of the template
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

        //Add the actionControllers template into the slack template to return
        //Use .value() to unwrap the lodash wrapper
        finalTemplate.attachments = templateAttachments.value();

        return finalTemplate;
    }

    getCharacterClasses() {

        //var characterClassesTemplate = slackTemplates.generateCharacterClassList;
        
        //Get all available classes from local
        let localCharacterClasses = this.state.class;

        //Get an array of all class IDs
        let classIDs = Object.keys(localCharacterClasses);

        let characterClassesTemplate = {};

        characterClassesTemplate.attachments = classIDs.map( singleClassID =>{

            return {
                "title": localCharacterClasses[singleClassID].name,
                "fallback": "You are unable to choose an action",
                "callback_id": "",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "image_url": "https://scrum-wars.herokuapp.com/public/images/fullSize/" + singleClassID + ".jpg",
                "actions": [{
                    "name": 'classSelection',
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

        return Object.keys(this.state.character)
            .map( eachCharacterID =>{
                return new Character(this.state, eachCharacterID)
            })
            .filter( eachCharacter => {
                //Why did I only return not hidden characters?
                //return eachCharacter.props.active === 1 && eachCharacter.props.zone_id === zoneID && eachCharacter.props.is_hidden === 0
                return eachCharacter.props.active === 1 && eachCharacter.props.zone_id === zoneID
            })
            .map( eachCharacter => {
                return eachCharacter.id
            })
    }

    getCharactersInZone(zoneID, requestSlackUserID){
        console.log('called getCharactersInZone');

        //Pass in the slack user id making the call.  The constructor will set the DB user ID based on slack user
        //var localUser = new User(this.state, requestSlackUserID);
        
        

        //Get the local character's id
        //var characterID = localUser.getCharacterID();

        //var localCharacter = new Character(this.state, characterID);

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

    getEquippedItemView(localCharacter){

        //get array of all available equipment slot keys (IDs)
        let equipmentSlotKeys = Object.keys(this.state.equipment_slot);

        let singleEquipmentSlot;

        //Iterate through all the standard inventory slots to create a template with an attachment for each slot
        return equipmentSlotKeys.map( eachEquipmentSlot =>{
            
            singleEquipmentSlot = new EquipmentSlot(this.state, eachEquipmentSlot);

            let equippedSlotItem = localCharacter.getEquipmentInSlot(singleEquipmentSlot.id);
            
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
                "thumb_url": "https://scrum-wars.herokuapp.com/public/images/thumb/" + formattedSlot.item_id + ".jpg",
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

