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



class Game {
    constructor() {
        
        this.baseURL = 'https://scrum-wars.herokuapp.com/';
        
        this.avatarPath = 'public/images/fullSize/character_avatar/';
        this.skillImagePath = 'public/images/thumb/';
        this.imagePath = 'public/images/';
        this.thumbImagePath = 'public/images/thumb/';
        
        this.maleAvatarFileNames = fs.readdirSync(this.avatarPath + 'male');
        this.femaleAvatarFileNames = fs.readdirSync(this.avatarPath + 'female');
        
        //GAME SETTINGS
        
        //Configuration: # of minutes per turn
        this.turnLengthMinutes = 60;
        //Default Slack left side border menu color
        this.menuColor = '#000000';
        this.matchStartTime = 16;
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
        console.log(`called game.createMatch(${zoneID})`);

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

    createCharacter(){
        
        let localRandomID = (this.randomGenerator() + this.randomGenerator() + this.randomGenerator() + this.randomGenerator() + this.randomGenerator()).toLowerCase();

        let currentCharacters = this.state.character;

        let newChar = {
            [localRandomID]: {
                action_points: 0,
                active: 1,
                name: 'Unknown Traveler',
                level: 1,
                gold: 100,
                health: 100, //Need to make this class dictated
                is_hidden: 0,
                match_wins: 0,
                zone_id: '-Khu9Zazk5XdFX9fD2Y8',
                stats_base: {
                    hit_points: 100,
                    armor: 0
                },
                stats_current: {
                    hit_points: 100,
                    armor: 0
                }
            }
        };

        //Mutate the object
        Object.assign(currentCharacters, newChar);
        
        return localRandomID;
    }

    createUser(slackRequestUserID){
        let randomID = (this.randomGenerator() + this.randomGenerator() + this.randomGenerator() + this.randomGenerator() + this.randomGenerator()).toLowerCase();

        let currentUsers = this.state.user;

        let newUser = {
            [randomID]: {
                slack_user_id: slackRequestUserID,
                permission_id: '-KztKzvAkoPFhI3ShzCu' //Default permission
            }
        };

        //Mutate the object
        Object.assign(currentUsers, newUser);

        return randomID;
    }
    
    getCurrentMatchID(){
        return this.state.global_state.match_id
    }

    getCharacterClasses() {
        console.log('called Game.getCharacterClasses()');
        
        //Get all available classes from local
        let localCharacterClasses = this.state.class;

        //Get an array of all class IDs
        let classIDs = Object.keys(localCharacterClasses);

        //let characterClassesTemplate = {};

        return classIDs
            .map( eachClassID =>{
                return new Class(this.state, eachClassID);
            })
            //Filter active classes only
            .filter( eachClassObject =>{
                return eachClassObject.props.active === 1
            });
    }

    getCharacterIDsInZone(zoneID){
        console.log('called getCharacterIDsInZone');

        return Object.keys(this.state.character)
            .map( eachCharacterID =>{
                //Create a character object for each character
                return new Character(this.state, eachCharacterID)
            })
            .filter( eachCharacter => {
                //Why did I only return not hidden characters?
                //return eachCharacter.props.active === 1 && eachCharacter.props.zone_id === zoneID && eachCharacter.props.is_hidden === 0
                return eachCharacter.props.active === 1 && eachCharacter.props.zone_id === zoneID
            })
            .map( eachCharacter => {
                //Return only the character's ID
                return eachCharacter.id
            })
    }

    getCharacters(){
        console.log('called Game.getCharacters()');

        return Object.keys(this.state.character)
            .map( eachCharacterID =>{
                //Create a character object for each character
                return new Character(this.state, eachCharacterID)
            })
    }

    getCharactersInZone(zoneID){
        console.log('called getCharacterIDsInZone');

        return Object.keys(this.state.character)
            .map( eachCharacterID =>{
                //Create a character object for each character
                return new Character(this.state, eachCharacterID)
            })
            .filter( eachCharacter => {
                return eachCharacter.props.active === 1 && eachCharacter.props.zone_id === zoneID
            })
    }

    getEquippedItemView(localCharacter){

        //get array of all available equipment slot keys (IDs)
        let equipmentSlotKeys = Object.keys(this.state.equipment_slot);

        let singleEquipmentSlot;

        //Iterate through all the standard inventory slots to create a template with an attachment for each slot
        return equipmentSlotKeys.map( eachEquipmentSlot =>{
            
            singleEquipmentSlot = new EquipmentSlot(this.state, eachEquipmentSlot);

            //Item equipped, if nothing equipped return undefined
            let equippedSlotItem = localCharacter.getEquipmentInSlot(singleEquipmentSlot.id);

            console.log('DEBUG equippedSlotItem: ', equippedSlotItem);

            let baseTemplate = {
                "title": singleEquipmentSlot.props.name,
                "callback_id": "",
                "fallback": "You are unable select that item",
                //Empty slot icon.  This is overridden when there is an equipped item
                "thumb_url": "https://scrum-wars.herokuapp.com/public/images/thumb/-Kjk3sGUJy5Nu8GWsdff.jpg",
                "color": this.menuColor,
                "fields": [{
                    "title": "itemList",
                    "value": "",
                    "short": false
                }],
                "actions": []
            };

            //If defined then there is an item equipped
            if(typeof equippedSlotItem !== "undefined"){
                let equippedItem = new Item(this.state, equippedSlotItem.item_id);

                //TODO maybe add a get file extension type so I dont hardcode .png?

                baseTemplate.thumb_url = `https://scrum-wars.herokuapp.com/public/images/thumb/${equippedItem.props.icon_name}.png`;

                //If there is an item, add an inspect button
                baseTemplate.actions.push({
                    "name": "equipmentSelection",
                    "color": this.menuColor,
                    "text": "Inspect item",
                    "style": "default",
                    "type": "button",
                    "value": equippedItem.id
                })
            };
            
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
    Game
};

