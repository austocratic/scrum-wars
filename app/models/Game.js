'use strict';

const fs = require('fs');

const Firebase = require('../libraries/firebase').Firebase;
const firebase = new Firebase();

const Character = require('./Character').Character;
const Class = require('./Class').Class;
const Item = require('./Item').Item;
const EquipmentSlot = require('./EquipmentSlot').EquipmentSlot;
const Zone = require('./Zone').Zone;

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
                        .forEach( eachEffect => {
                            //Accumulate the modifiers
                            if(eachEffect.modifiers){
                                eachActiveCharacterObject.accumulateProperties(cumulativeModifiers, eachEffect.modifiers);
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

        //Set each character's Attack Power, Attack Mitigation, damage min, damage max
        //This happens after the above iterator function so that character stats are set
        characterIDs
            .map( eachCharacterID =>{
                return new Character(this.state, eachCharacterID)
            })
            .forEach( eachCharacter=>{

                //----Physical damage (attack & mitigation)----

                //Attack Power:
                //level modifier + strength
                let attackPower = (eachCharacter.props.level * 4) + eachCharacter.props.stats_current.strength;

                eachCharacter.updateProperty('stats_current.attack_power', attackPower);

                //Attack Mitigation
                let attackMitigation = (eachCharacter.props.level * 4) + eachCharacter.props.stats_current.armor;

                eachCharacter.updateProperty('stats_current.attack_mitigation', attackMitigation);

                //Minimum damage:
                //Damage listed on weapon in character's hand
                eachCharacter.updateProperty('stats_current.damage_minimum', eachCharacter.props.stats_current.damage);

                //If no weapon:
                //If 2 weapons: use primary hand, **Wont worry about secondary hand for now
                //Maximum damage:
                eachCharacter.updateProperty('stats_current.damage_maximum', (eachCharacter.props.stats_current.damage * 2));


                //----Magic damage (attack & mitigation)----

                //Attack Power:
                //level modifier + intelligence
                let magicAttackPower = (eachCharacter.props.level * 4) + eachCharacter.props.stats_current.intelligence;

                eachCharacter.updateProperty('stats_current.magic_attack_power', magicAttackPower);

                let magicResistance = (eachCharacter.props.level * 4) + eachCharacter.props.stats_current.magic_resistance;

                eachCharacter.updateProperty('stats_current.magic_resistance', magicResistance);
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
                active: 1,
                avatar: '', //Default blank character avatar
                gold: 100,
                hit_points: 10, //Move this to class specific
                level: 1,
                mana_points: 10, //Move this to class specific
                match_wins: 0,
                name: 'Unknown Traveler',
                stamina_points: 10, //Move this to class specific
                stats_base: {
                    hit_points: 100,
                    armor: 0
                },
                stats_current: {
                    hit_points: 100,
                    armor: 0
                },
                strike_back: {
                    melee: 0,
                    range: 0
                },
                zone_id: '-Khu9Zazk5XdFX9fD2Y8', //Default starting zone
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

    getLastMatchID(){
        return this.state.global_state.last_match_id
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

    //Pass in a character ID.  Return all character IDs on that character's team (including ID passed)
    getCharacterIDsOnTeam(characterID){

        //Get a nested array of teams
        let nestedTeams = this.state.match[this.state.global_state.match_id].teams
            .filter(eachTeam=>{
                return eachTeam.indexOf(characterID) >= 0
            });

        return nestedTeams[0];

        //Get the teams nested array
        /*
        let teams = this.state.match[this.state.match.global_state.match_id].teams;

        //Filter for all the teams that the character ID is in
        let nestedTeams = teams.filter(eachTeam=>{
            return eachTeam.indexOf(characterID) >= 0
        });

        //Character should only be on one team, so return the first element (array of character IDs)
        return nestedTeams[0];*/
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
        console.log('called getCharactersInZone');

        return Object.keys(this.state.character)
            .map( eachCharacterID =>{
                //Create a character object for each character
                return new Character(this.state, eachCharacterID)
            })
            .filter( eachCharacter => {
                return eachCharacter.props.active === 1 && eachCharacter.props.zone_id === zoneID
            })
    }

    getCharactersInArena(){
        console.log('called getCharactersInArena()');

        //Get the arena
        const arena = Object.keys(this.state.zone)
            .map(eachZoneID=>{

                console.log('DEBUG eachZoneID: ', eachZoneID);

                return new Zone(this.state, this.state.zone[eachZoneID].channel_id)
            })
            .find(eachZone =>{

                console.log('DEBUG eachZone: ', JSON.stringify(eachZone.props));
                return eachZone.channel === "arena"
            });

        console.log('DEBUG arena: ', JSON.stringify(arena.props));

        return this.getCharactersInZone(arena.id)
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

            //console.log('DEBUG equippedSlotItem: ', equippedSlotItem);

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

