"use strict";

var characterProfile = require('../menus/characterProfile').characterProfile;


var Game = require('../models/Game').Game;
var Item = require('../models/Item').Item;
var Character = require('../models/Character').Character;
var User = require('../models/User').User;

var slackTemplates = require('../slackTemplates');

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

    //Get game's current state
    var game = new Game();

    //Set the game state locally
    await game.getState();

    var responseTemplate = getResponseTemplate(slackCallback, actionName, actionValue, slackUserID, slackChannelID);

    console.log('responseTemplate to update: ', JSON.stringify(responseTemplate));

    //Overwrites with updated local props
    await game.updateState();

    //Send success response
    res.status(200).send(responseTemplate);

    //Lookup the callback & name take an action and returns result
    function getResponseTemplate(requestCallback, requestActionName, requestActionValue, requestSlackUserID, requestSlackChannelID) {

        console.log('called getResponseTemplate, requestCallback: ', requestCallback);
        console.log('called getResponseTemplate, requestActionName: ', requestActionName);
        console.log('called getResponseTemplate, requestActionValue: ', requestActionValue);

        var slackTemplate;

        //parse the callback string into an array.
        var slackCallbackElements = requestCallback.split("/");

        //Get the last element of the callback
        var lastCallbackElement = slackCallbackElements[slackCallbackElements.length - 1];

        //Pass in the slack user id making the call.  The constructor will set the DB user ID based on slack user
        var localUser = new User(game.state, requestSlackUserID);

        //Get the local character's id
        var characterID = localUser.getCharacterID();

        //Create a local character object
        var localCharacter = new Character(game.state, characterID);


        //Could check for "back" selection & regardless of callback context, it will trigger the below condition

        if (requestActionName == 'back'){

            //If back was selected, parse out the prior view in the callback
            var priorCallback = slackCallbackElements[slackCallbackElements.length - 2];

            //Parse the priorView from view & selection
            var priorCallbackSplit = priorCallback.split(":");

            //var priorView = priorCallbackSplit[priorCallbackSplit.length - 2];

            lastCallbackElement = priorCallbackSplit[priorCallbackSplit.length - 2];

            //return responseTemplateSwitch(priorView, requestActionName);
        }

        console.log('Modified lastCallbackElement: ', lastCallbackElement);

        //Switch logic looks at the view & the button selected to return a template
        return responseTemplateSwitch(lastCallbackElement, requestActionName);

        //Switch logic to determine action
        function responseTemplateSwitch(viewSelection, buttonSelection){

            switch (viewSelection) {

                case 'actionList':

                    switch (buttonSelection){

                        case 'Shop':

                            console.log('called actionList/shop');

                            slackTemplate = game.shopList(requestSlackChannelID);

                            //Previous callback includes the menu selection was made from, now add the selection & the next menu
                            slackTemplate.attachments[1].callback_id = slackCallback + ':Shop/shopList';

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

                    //Add purchase buttons to the bottom of the template
                    slackTemplate.attachments[0].actions = [{
                        "name": "yes",
                        "text": "Yes, I'll take it!",
                        "type": "button",
                        "value": "yes"
                    },
                        {
                            "name": "back",
                            "text": "No thanks",
                            "type": "button",
                            "value": "no"
                        }];

                    //Previous callback includes the menu selection was made from, now add the selection & the next menu
                    slackTemplate.attachments[0].callback_id = slackCallback + ':' + localItem.id + '/itemDetail';

                    return slackTemplate;

                    break;

                case 'itemDetail':

                    console.log('called itemDetail');

                    switch (buttonSelection){

                        case 'yes':

                            console.log('called itemDetail/yes');

                            //Get the item ID from the callback, it is found in the 2nd to last element of the parsed callback
                            var itemSelection = slackCallbackElements[slackCallbackElements.length - 2];

                            var valueSelection = itemSelection.split(":");

                            var itemID = valueSelection[valueSelection.length - 1];

                            return localCharacter.purchaseItem(new Item(game.state, itemID));

                            break;

                        /*
                        case 'no':

                            console.log('called itemDetail/no');

                            //Return the player to item selection menu
                            slackTemplate = game.shopList(requestSlackChannelID);

                            console.log('callback string: ', JSON.stringify(slackCallbackElements));

                            //Overwrite the callback to "backtrack" and get rid of the previous selection path
                            slackTemplate.attachments[0].callback_id = 'actionList:Shop/shopList';

                            return slackTemplate;

                            break;*/
                    }

                    break;

                case 'characterProfile':

                    switch (buttonSelection) {

                        case 'Inventory':

                            console.log('called characterProfile/Inventory');

                            slackTemplate = slackTemplates.itemList;

                            //Pass in the character's unequipped inventory array
                            slackTemplate.attachments[0].actions[0].options = game.getItemList(localCharacter.props.inventory.unequipped);

                            //Previous callback includes the menu selection was made from, now add the selection & the next menu
                            slackTemplate.attachments[0].callback_id = slackCallback + ':Inventory/itemDetail';

                            return slackTemplate;

                            break;

                        case 'Equipment':

                            console.log('called characterProfile/Equipment');

                            slackTemplate = slackTemplates.itemList;

                            //Pass in the character's unequipped inventory array
                            slackTemplate.attachments = game.getEquipmentList(localCharacter.props.inventory.equipped);

                            console.log('Equipment template: ', JSON.stringify(slackTemplate.attachments));

                            //Previous callback includes the menu selection was made from, now add the selection & the next menu
                            slackTemplate.attachments[0].callback_id = slackCallback + ':Equipment/itemDetail';

                            return slackTemplate;

                            break;
                    }

                    break;

                case 'inventoryList':

                    //Return an item detail with the selection from the inventory list


                    break;

                case 'inventory':

                    //Inventory view has 2 elements:
                    //1. Inventory list drop down
                    //2. Back button

                    switch (buttonSelection) {

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

                    switch (buttonSelection) {

                        case 'equipment-list':

                            //Load the item profile view

                            break;

                        case 'back-button':

                            //Load the character profile view

                            break;
                    }

                    break;

                default:

                    console.log('callback not supported: ', viewSelection);

                    break;
            }
        }


    }
};