"use strict";

var characterProfile = require('../menus/characterProfile').characterProfile;

var inventoryMenu = require('../menus/inventoryMenu').inventoryMenu;
var equipmentMenu = require('../menus/equipmentMenu').equipmentMenu;

var Game = require('../models/Game').Game;
var Item = require('../models/Item').Item;

/*

1. Get game's current state
2. Validate request
3. Extract properties from request payload locally
4. 

*/
exports.slackInteractiveMessage = async (req, res, next) => {

    //TODO: bad to use try/catch here.  Need to read the content type header and act accordingly
    //Parse the payload of the message
    var slackPayload;
    try {
        slackPayload = JSON.parse(req.body.payload);
    } catch(err){
        slackPayload = req.body.payload;
    }

    /*
     Format of API calls coming from slack:
     callback: what view the interaction was made from
     name:     button clicked on from that view
     value:    optional specific selection made
     */

    console.log('Incoming request to slackEvent: ', JSON.stringify(slackPayload));
    
    var slackUserID, slackChannelID, actionValue;

    //TODO: I think that all user ids come in this format when calling interactive messages
    slackUserID = slackPayload.user.id;

    console.log('slackUserID: ', slackUserID);

    slackChannelID = slackPayload.channel.id;

    console.log('slackChannelID: ', slackChannelID);

    //Action name dictates which button was pressed
    var actionName = slackPayload.actions[0].name;

    if (slackPayload.actions[0].value) {
        actionValue = slackPayload.actions[0].value
    } else {
        //Action value dicates the specific selection from drop down menus
        actionValue = slackPayload.actions[0].selected_options[0].value;
    }

    var slackCallback = slackPayload.callback_id;

    //parse the callback string.  Look at the last element in the callback to determine response
    var slackCallbackElements = slackCallback.split("/");

    //Get the last element of the callback
    var lastCallbackElement = slackCallbackElements[slackCallbackElements.length - 1];

    //Get game's current state
    var game = new Game();

    //Set the game state locally
    await game.getState();

    var responseTemplate = getResponseTemplate(lastCallbackElement, actionName, actionValue, slackUserID, slackChannelID);

    console.log('responseTemplate to update: ', JSON.stringify(responseTemplate));

    //Overwrites with updated local props
    await game.updateState();

    //Send success response
    res.status(200).send(responseTemplate);

    //Lookup the callback & name take an action and returns result
    function getResponseTemplate(requestView, requestActionName, requestActionValue, requestSlackUserID, requestSlackChannelID) {

        console.log('called getResponseTemplate, requestView: ', requestView);
        console.log('called getResponseTemplate, requestActionName: ', requestActionName);
        console.log('called getResponseTemplate, requestActionValue: ', requestActionValue);

        var slackTemplate;

        switch (requestView) {

            case 'actionList':

                switch (requestActionName){

                    case 'Shop':
                        
                        console.log('called actionList/shop');
                        
                        slackTemplate = game.shopList(requestSlackChannelID);

                        //Previous callback includes the menu selection was made from, now add the selection & the next menu
                        slackTemplate.attachments[0].callback_id = slackCallback + ':Shop/shopList';

                        return slackTemplate;
                        
                    break;
                }

                break;

            case 'shopList':

                console.log('called shopList');

                //Create a local item
                var localItem = new Item(game.state, requestActionValue);
                
                //Create an item detail view template
                slackTemplate = localItem.getDetailView();

                console.log('shopList slackTemplate: ', JSON.stringify(slackTemplate));

                //Previous callback includes the menu selection was made from, now add the selection & the next menu
                slackTemplate.attachments[0].callback_id = slackCallback + ':' + localItem.id + '/itemDetail';

                return slackTemplate;
                
                //Add purchase buttons to the bottom

                break;

            case 'characterProfile':

                switch (requestActionName) {

                    case 'inventory-button':

                        //return the inventory view
                        //return await
                        inventoryMenu(requestUserID);

                        break;

                    case 'equipment-button':

                        //return the equipment view
                        
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

                break;

            default:

                console.log('callback not supported: ', requestView);

                break;
        }
    }
};