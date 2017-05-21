"use strict";

//This index file contains references to all the interaction files
var interactions = require('./interactions/interactionsIndex').interactionsIndex;
var Firebase = require('../libraries/firebase').Firebase;


exports.interactions = (interactionType, messagePayloadInput) => {
    
    return new Promise((resolve, reject) => {

        switch(interactionType){

            case 'travel':

                interactions.travel(messagePayloadInput)
                    .then( () =>{
                        resolve();
                        
                    })
                    .catch( () =>{
                        reject();
                    });
                
                break;

            case 'travelDialogueSelection':

                interactions.travelDialogueSelection(messagePayloadInput)
                    .then( template =>{
                        resolve(template);

                    })
                    .catch( () =>{
                        reject();
                    });

                break;

            //Set the name property user's character
            case 'nameCharacter':

                interactions.nameCharacter(messagePayloadInput)
                    .then( template =>{
                        resolve(template);

                    })
                    .catch( () =>{
                        reject();
                    });
                
                break;

            case 'characterProfile':

                interactions.characterProfile(messagePayloadInput)
                    .then( template =>{
                        resolve(template);

                    })
                    .catch( () =>{
                        reject();
                    });
                
                break;
            
            case 'characterSelectionNew':

                interactions.characterSelectionNew(messagePayloadInput)
                    .then( template =>{
                        resolve(template);

                    })
                    .catch( () =>{
                        reject();
                    });

                break;

            case 'characterSelectionClass':

                interactions.characterSelectionClass(messagePayloadInput)
                    .then( template =>{
                        resolve(template);

                    })
                    .catch( () =>{
                        reject();
                    });
                
                break;

            case 'characterClassSelectionConfirmation':

                interactions.characterClassSelectionConfirmation(messagePayloadInput)
                    .then( template =>{
                        resolve(template);

                    })
                    .catch( () =>{
                        reject();
                    });

                break;

            case 'profileOptionSelection':

                interactions.profileOptionSelection(messagePayloadInput)
                    .then( template =>{
                        resolve(template);

                    })
                    .catch( () =>{
                        reject();
                    });

                break;

            case 'playerAction':

                interactions.playerAction(messagePayloadInput)
                    .then( template =>{
                        resolve(template);

                    })
                    .catch( () =>{
                        reject();
                    });
                
                break;

            case 'playerActionSelection':

                interactions.playerActionSelection(messagePayloadInput)
                    .then( template =>{
                        resolve(template);

                    })
                    .catch( () =>{
                        reject();
                    });

                break;
            
            case 'playerAttack':

                interactions.playerAttack(messagePayloadInput)
                    .then( template =>{
                        resolve(template);

                    })
                    .catch( () =>{
                        reject();
                    });

                break;

            case 'shopItemSelection':

                interactions.shopItemSelection(messagePayloadInput)
                    .then( template =>{
                        resolve(template);

                    })
                    .catch( () =>{
                        reject();
                    });

                break;

            case 'shopPurchaseConfirm':

                interactions.shopItemSelectionConfirmation(messagePayloadInput)
                    .then( template =>{
                        resolve(template);

                    })
                    .catch( () =>{
                        reject();
                    });

                break;

            case 'inventoryItemInspection':

                interactions.inventoryItemInspection(messagePayloadInput)
                    .then( template =>{
                        resolve(template);

                    })
                    .catch( () =>{
                        reject();
                    });

                break;

            case 'equipmentItemInspection':

                interactions.equipmentItemInspection(messagePayloadInput)
                    .then( template =>{
                        resolve(template);

                    })
                    .catch( () =>{
                        reject();
                    });

                break;

            default:

                //return "ERROR: template not supported"
        }
    });
};