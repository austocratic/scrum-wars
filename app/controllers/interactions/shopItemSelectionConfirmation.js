"use strict";
var Firebase = require('../../libraries/firebase').Firebase;
//var shopCharacterSelection = require('../../slackTemplates/shopCharacterSelection').shopCharacterSelection;
var playerActionSelection = require('./playerActionSelection').playerActionSelection;


exports.shopItemSelectionConfirmation = payload => {

    //Need to read the value from the previous selection
    //How do we get the item ID from the previous screen?
    var firebase = new Firebase();

    var responseTemplate = {

    };

    console.log('shopItemSelection payload: ', JSON.stringify(payload));

    console.log('user: ', payload.user);

    //Get the slack user ID who called the action
    var userID = payload.user.id;

    console.log('userID: ', userID);

    return new Promise((resolve, reject) => {

    //Get your character
    firebase.get('character', 'user_id', userID)
        .then( character => {

            console.log('character: ', character);

            //Character's ID
            var characterID = Object.keys(character)[0];

            //Set the player's character locally
            var playerCharacter = character[characterID];

            console.log('playerCharacter: ', playerCharacter);

            //get the value of the item selected
            var purchaseSelection = payload.actions[0].value;

            //If user selected no, return them to the main shopping screen
            if (purchaseSelection === "no") {

                responseTemplate = payload;

                //Set the callback to trigger the shopping menu again
                responseTemplate.callback_id = "actionMenu";
                responseTemplate.actions = [{"name":"class","type":"button","value":"shop"}];

                playerActionSelection(responseTemplate)
                    .then(shopResponse=>{

                        shopResponse.text = "Ok, what else can I interest you in?";

                        console.log('shopResponse: ', shopResponse);
                        resolve(shopResponse);
                    })

            } else {

                //Now that we have determined that the player wants to buy the item, lookup the item's price
                firebase.get(('item/' + purchaseSelection))
                    .then( itemProps => {

                        var playerGold = playerCharacter.gold;

                        console.log('playerGold: ', playerGold);

                        var playerInventory;

                        //Get the player's inventory array so it can be adjusted locally
                        //Check that the player has inventory set
                        if (playerCharacter.inventory) {
                            playerInventory = playerCharacter.inventory;
                        } else {
                            playerInventory = [];
                        }

                        console.log('playerInventory: ', playerInventory);

                        var itemCost = itemProps.cost;

                        console.log('itemCost: ', itemCost);

                        //Compare the item's price to the character's gold
                        if (itemCost > playerGold) {

                            responseTemplate = payload;

                            //Set the callback to trigger the shopping menu again
                            responseTemplate.callback_id = "actionMenu";
                            responseTemplate.actions = [{"name":"class","type":"button","value":"shop"}];

                            playerActionSelection(responseTemplate)
                                .then(shopResponse=>{

                                    responseTemplate.text = "I'm sorry traveler, you don't have " + itemCost + " gold." +
                                        "\nCan I interest you in something else?";

                                    console.log('shopResponse: ', shopResponse);
                                    resolve(shopResponse);
                                });

                            //Character does not have enough gold, resolve with template that will return them to shopping screen
                            resolve(responseTemplate)
                        }

                        //Decrement the player's gold locally
                        playerGold = playerGold - itemCost;

                        //Add the purchased item to inventory array
                        playerInventory.push(purchaseSelection);

                        console.log('playerInventory updated: ', playerInventory);

                        //Update player's character by setting the adjusted gold & adjusted inventory
                        var updates = {
                            "gold": playerGold,
                            "inventory": playerInventory
                        };

                        //Create a table reference to be used for locating the character
                        var tableRef = 'character/' + characterID;

                        //Update the character
                        firebase.update(tableRef, updates)
                            .then( ()=> {

                                //Set the response template to successful purchase
                                responseTemplate.text = "_You hand the merchant " +itemCost + " in exchange for the " + itemProps.name + "_" + "\nThank you for you patronage.  Safe travels, my friend";

                                //Then return the new template
                                resolve(responseTemplate)
                            })
                    })
                }
            });
        });
    
};
    
    
    