"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var Character = require('../Character').Character;
var Item = require('../Item').Item;
var inventoryMenu = require('../../menus/inventoryMenu').inventoryMenu;
var equipmentMenu = require('../../menus/equipmentMenu').equipmentMenu;


exports.profileOptionSelection = payload => {

    return new Promise((resolve, reject) => {

    switch(payload.actions[0].name){
        case 'equip_item':

            console.log('hit equip_item condition in profileOptionSelection');

            var equippedItem = new Item();
            equippedItem.setByID(payload.actions[0].value)
                .then(()=>{

                    var playerCharacter = new Character();
                    playerCharacter.setByProperty('user_id', payload.user.id)
                        .then(()=>{
                            
                            playerCharacter.equipItem(equippedItem)
                                .then(()=>{
                                    
                                    var slackResponseText = {
                                        'text': 'You equip ' + equippedItem.props.name
                                    };
                                    
                                    resolve(slackResponseText);
                                })
                        })
                });

            break;
        
        case 'unequip_item':

            var unequippedItem = new Item();
            unequippedItem.setByID(payload.actions[0].value)
                .then(()=>{

                    var playerCharacter = new Character();
                    playerCharacter.setByProperty('user_id', payload.user.id)
                        .then(()=>{

                            playerCharacter.unequipItem(unequippedItem)
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



        
    })
};