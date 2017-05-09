"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var inventoryMenu = require('../inventoryMenu').inventoryMenu;
var equipmentMenu = require('../equipmentMenu').equipmentMenu;


exports.profileOptionSelection = payload => {

    var profileOption = payload.actions[0].value;
    
    return new Promise((resolve, reject) => {

        //Read the selection to determine response
        switch(profileOption){
            
            case 'inventory':

                inventoryMenu(payload)
                    .then( interactionResponse => {
                        resolve(interactionResponse)
                    });
                
                break;
            
            case 'equipment':

                equipmentMenu(payload)
                    .then( interactionResponse => {
                        resolve(interactionResponse)
                    });
                
                break;
            
            default:
            
        }
        
    })
};