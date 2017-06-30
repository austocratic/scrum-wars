"use strict";

var characterProfile = require('../menus/characterProfile').characterProfile;

var inventoryMenu = require('../menus/inventoryMenu').inventoryMenu;
var equipmentMenu = require('../menus/equipmentMenu').equipmentMenu;

var Game = require('../models/Game').Game;

/*

1. Get game's current state
2. Validate request
3. Extract properties from request payload locally
4. 

*/
exports.slackInteractiveMessage = async (req, res, next) => {

    var slackPayload = req.body.payload;

    /*
    Format of API calls coming from slack:
        callback: what view the interaction was made from
        name:     button clicked on from that view
        value:    optional specific selection made
    */
    
    console.log('Incoming request to slackEvent: ', JSON.stringify(slackPayload));

    //TODO: bad to use try/catch here.  Need to read the content type header and act accordingly
    //Parse the payload of the message
    /*
    var messagePayload, userID;
    try {
        messagePayload = JSON.parse(req.body.payload);
    } catch(err){
        messagePayload = req.body.payload;
    }*/


    //Get the callback property
    var view = slackPayload.callback_id;

    var userID;

    //TODO: I think that all user ids come in this format when calling interactive messages
    userID = slackPayload.user.id;
    
    //Get the user ID property (formatted differently based on /command or callback)
    /*
    try {
        userID = slackPayload.user.id;
    } catch(err){
        //Slash commands are formatted in this way
        userID = slackPayload.user_id;
    }*/

    var actionName = slackPayload.actions[0].name;

    var actionValue = slackPayload.actions[0].value;

    console.log('actionName: ', actionName);

    //Get game's current state
    var game = new Game();
    
    //Set the game state locally
    await game.getState();
    
    await processRequest(view, actionName, actionValue, userID);
    
    //Overwrites with updated local stats
    await game.updateState();

    //Send success response
    res.status(200).send();
    
    //Lookup the callback & name take an action and returns result
    async function processRequest(requestView, requestActionName, requestActionValue, requestUserID) {
        switch (requestView) {

            case 'characterProfile':

                switch (requestActionName) {

                    case 'inventory-button':

                        //return the inventory view
                        //return await
                        inventoryMenu(requestUserID);

                        break;

                    case 'equipment-button':

                        //return the equipment view
                        return await
                        equipmentMenu(requestUserID);

                        break;
                }

                break;

            case 'inventory':

                //Inventory view has 2 elements:
                //1. Inventory list drop down
                //2. Back button

                switch (requestActionName) {

                    case 'inventory-list':

                        //Load the item profile view

                        break;

                    case 'back-button':

                        //Load the character profile view

                        break;
                }

                break;

            case 'equipment':

                //Equipment view has 2 elements:
                //1. Equipment list drop down
                //2. Back button

                switch (requestActionName) {

                    case 'equipment-list':

                        //Load the item profile view

                        break;

                    case 'back-button':

                        //Load the character profile view

                        break;
                }

            default:

                break;
        }
    }
};