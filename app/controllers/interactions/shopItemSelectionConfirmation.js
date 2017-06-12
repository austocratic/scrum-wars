"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var Character = require('../Character').Character;
var Item = require('../Item').Item;

var playerActionSelection = require('./playerActionSelection').playerActionSelection;




exports.shopItemSelectionConfirmation = payload => {

    //Need to read the value from the previous selection
    //How do we get the item ID from the previous screen?
    var firebase = new Firebase();

    //Setup blank response (to be populated)
    var responseTemplate = {};

    return new Promise((resolve, reject) => {

    var playerCharacter = new Character();

    //Create a character reference locally
    playerCharacter.setByProperty('user_id', payload.user.id)
        .then(()=>{

            //Character's ID
            /*
            var characterID = Object.keys(character)[0];

            //Set the player's character locally
            var playerCharacter = character[characterID];*/

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

                        resolve(shopResponse);
                    })

            } else {

                purchaseSelection = new Item();

                console.log('purchaseSelection: ', purchaseSelection);

                purchaseSelection.setByID(purchaseSelection)
                    .then(()=>{

                        var playerInventory;

                        /*
                        //Get the player's inventory array so it can be adjusted locally
                        //Check that the player has inventory set
                        if (playerCharacter.props.inventory) {
                            playerInventory = playerCharacter.props.inventory;
                        } else {
                            playerInventory = [];
                        }*/

                        //Compare the item's price to the character's gold
                        if (purchaseSelection.props.cost > playerCharacter.props.gold) {

                            responseTemplate = payload;

                            //Set the callback to trigger the shopping menu again
                            responseTemplate.callback_id = "actionMenu";
                            responseTemplate.actions = [{"name":"class","type":"button","value":"shop"}];

                            playerActionSelection(responseTemplate)
                                .then(shopResponse=>{

                                    shopResponse.text = "I'm sorry traveler, you don't have " + purchaseSelection.props.cost + " gold." +
                                        "\nCan I interest you in something else?";

                                    resolve(shopResponse);
                                });
                        } else {

                            playerCharacter.purchaseItem(purchaseSelection.props.cost)


                            /*
                            //Decrement the player's gold locally
                            playerGold = playerGold - itemCost;

                            //Add the purchased item to unequipped inventory array
                            playerInventory.unequipped.push(purchaseSelection);

                            //Update player's character by setting the adjusted gold & adjusted inventory
                            var updates = {
                                "gold": playerGold,
                                "inventory": playerInventory
                            };

                            //Create a table reference to be used for locating the character
                            var tableRef = 'character/' + playerCharacter.props.id;

                            //Update the character
                            firebase.update(tableRef, updates)*/
                                .then( ()=> {

                                    //Set the response template to successful purchase
                                    responseTemplate.text = "_You hand the merchant " + purchaseSelection.props.cost + " in exchange for the " + purchaseSelection.props.name + "_" + "\nThank you for you patronage.  Safe travels, my friend";

                                    //Then return the new template
                                    resolve(responseTemplate)
                                })
                        }
                    })
                }
            });
        });
    
};
    
    
    