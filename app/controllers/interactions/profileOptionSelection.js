/*"use strict";

var Character = require('../../models/Character').Character;
var Character_sync = require('../../models/Character_sync').Character;
var Item = require('../../models/Item').Item;
var Game = require('../../models/Game').Game;
var inventoryMenu = require('../../menus/inventoryMenu').inventoryMenu;
var equipmentMenu = require('../../menus/equipmentMenu').equipmentMenu;

//TODO - testing new methodolgy.  I will rename these methods
exports.profileOptionSelection = async payload => {

    switch(payload.actions[0].name){
        case 'equip_item':

            console.log('hit equip_item condition in profileOptionSelection');
            
            var localGame = new Game();
            
            //Get the game's current state .state property
            await localGame.getState();
            
            //TODO could replace with a new Item call here (if I modify to be syncronous)
            var itemToEquip = localGame.state.item[payload.actions[0].value];
            
            //TODO need to figure out how to find a nested property locally
            //TODO or I should make a User object.  That user object will hold the player's character
            var player = localGame.state.player['slack_user_id', payload.user.id];
            
            //Use the player's character_id to set a local character
            var playerCharacter = new Character_sync(localGame.state.character[player.character_id]);

            playerCharacter.equipItem(itemToEquip);

            await localGame.updateState();

            return {
                'text': 'You equip ' + itemToEquip.name
            };

            break;
        
        case 'unequip_item':

            var unequippedItem = new Item();
            unequippedItem.setByID(payload.actions[0].value)
                .then(()=>{

                    var playerCharacter = new Character();
                    playerCharacter.setByProperty('user_id', payload.user.id)
                        .then(()=>{

                            playerCharacter.unequipItem(unequippedItem.props.id)
                                .then(()=>{

                                    var slackResponseText = {
                                        'text': 'You unequip ' + unequippedItem.props.name
                                    };

                                    resolve(slackResponseText);
                                })
                        })
                });
            
            break;

        //TODO remove this as default, make the other name responses more robust
        default:

            //Read the selection to determine response
            switch(payload.actions[0].value) {

                case 'inventory':

                    inventoryMenu(payload)
                        .then(interactionResponse => {
                            resolve(interactionResponse)
                        });

                    break;

                case 'equipment':

                    equipmentMenu(payload)
                        .then(interactionResponse => {
                            resolve(interactionResponse)
                        });

                    break;
            }
            break;
    }
};

*/