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
 */


exports.slackSlashCommand = async (req, res, next) => {

    //TODO need validation to ensure request came from slack and is structured correctly

    //TODO: bad to use try/catch here.  Need to read the content type header and act accordingly
    //Parse the payload of the message
    /*
     var messagePayload;
     try {
     messagePayload = JSON.parse(req.body);
     } catch(err){
     messagePayload = req.body;
     }*/

    console.log('called slackSlashCommand');

    var slackPayload = req.body;

    var slackUserID, slackChannelID, slackTextInput;

    console.log('slackPayload: ', slackPayload);

    //Get the user ID property (formatted differently based on /command or callback)

    //TODO: I think that all user ids come in this format in slash commands
    slackUserID = slackPayload.user_id;

    slackChannelID = slackPayload.channel_id;

    slackTextInput = slackPayload.text;

    //Get the command property
    var slashCommand = slackPayload.command;

    //Modify slachCommand text to remove proceeding '/'
    var modifiedSlashCommand = slashCommand.slice(1, slashCommand.length);
    
    //Get game's current state
    var game = new Game();

    //Set the game state locally
    await game.getState();

    //Function format: getResponseTemplate(requestCallback, requestActionName, requestActionValue, requestSlackUserID, requestSlackChannelID) {
    //requestCallback = "command" could hard code
    //requestActionName =
    //requestActionValue
    //requestSlackUserID
    //requestSlackChannelID
    var responseTemplate = getResponseTemplate('command', modifiedSlashCommand, 'requestActionValue not used', slackUserID, slackChannelID, game);

    console.log('responseTemplate to update: ', JSON.stringify(responseTemplate));

    //Overwrites with updated local props
    await game.updateState();

    //Send success response
    res.status(200).send(responseTemplate);
};




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

    var responseTemplate = getResponseTemplate(slackCallback, actionName, actionValue, slackUserID, slackChannelID, game);

    console.log('responseTemplate to update: ', JSON.stringify(responseTemplate));

    //Overwrites with updated local props
    await game.updateState();

    //Send success response
    res.status(200).send(responseTemplate);
};

//Lookup the callback & name take an action and returns result
function getResponseTemplate(requestCallback, requestActionName, requestActionValue, requestSlackUserID, requestSlackChannelID, gameContext) {

    console.log('called getResponseTemplate, requestCallback: ', requestCallback);
    console.log('called getResponseTemplate, requestActionName: ', requestActionName);
    console.log('called getResponseTemplate, requestActionValue: ', requestActionValue);

    var slackTemplate;

    //parse the callback string into an array.
    var slackCallbackElements = requestCallback.split("/");

    //Get the last element of the callback
    var lastCallbackElement = slackCallbackElements[slackCallbackElements.length - 1];

    //Pass in the slack user id making the call.  The constructor will set the DB user ID based on slack user
    var localUser = new User(gameContext.state, requestSlackUserID);

    //Get the local character's id
    var characterID = localUser.getCharacterID();

    //Create a local character object
    var localCharacter = new Character(gameContext.state, characterID);

    //Check for back button selection.  If back, overwrite the
    if (requestActionName == 'back'){
        
        //remove the last two elements from the callback elements array
        slackCallbackElements.splice( slackCallbackElements.length - 2, 2);

        //take the last element & split it into view:selection
        //var lastSelection = slackCallbackElements[slackCallbackElements.length - 1].split(":");

        //Remove the selection from the last view:selection combo
        //lastSelection.pop();

        //console.log('lastSelection: ', lastSelection);

        //var joinedElements = slackCallbackElements.join("/");

        var lastSelection = slackCallbackElements[slackCallbackElements.length - 1].split(":");

        //Overwrite the requestActionName to the last selection (this will control the responseTemplateSwitch flow)
        requestActionName = lastSelection.pop();

        console.log('lastSelection: ', lastSelection);

        //Remove the last element this could leave an empty array
        slackCallbackElements.pop();

        console.log('slackCallbackElements after pop: ', slackCallbackElements);

        slackCallbackElements.push(lastSelection[lastSelection.length -1]);

        //Overwrite the last callback element
        lastCallbackElement = slackCallbackElements[slackCallbackElements.length - 1];

        console.log('slackCallbackElements after push: ', slackCallbackElements);

        //var joinedElements = slackCallbackElements.join("/");

        //Overwrite the callback
        requestCallback = slackCallbackElements.join("/");

        /*
         if (slackCallbackElements.length == 1) {
         joinedElements = joinedElements + "/"
         }*/

        console.log('new requestCallback: ', requestCallback);
    }

    console.log('Modified lastCallbackElement: ', lastCallbackElement);

    console.log('requestCallback after modification: ', requestCallback);

    //Switch logic looks at the view & the button selected to return a template
    return responseTemplateSwitch(lastCallbackElement, requestActionName);

    //Switch logic to determine action
    function responseTemplateSwitch(selectionContext, userSelection){

        switch (selectionContext) {

            //Commands are generated by slash commands
            case 'command':

                switch (userSelection){

                    case 'action':

                        console.log('Called command/action');

                        slackTemplate = gameContext.getAvailableActions(requestSlackUserID, requestSlackChannelID);

                        slackTemplate.attachments[0].callback_id = 'command:action/actionList';

                        return slackTemplate;

                    break;

                    case 'generate':

                        console.log('Called command/generate');
                        //Return the new character confirmation template
                        slackTemplate = slackTemplates.generateCharacterConfirmation;

                        slackTemplate.attachments[0].callback_id = 'command:action/characterConfirmation';

                        return slackTemplate;

                        break;

                    case 'profile':

                        console.log('Called command/profile');
                        slackTemplate = gameContext.characterProfile(requestSlackUserID, requestSlackChannelID);

                        //attachment 0 = character image
                        //attachment 1 = character stats
                        slackTemplate.attachments[2].callback_id = 'command:action/characterProfile';

                        return slackTemplate;

                        break;

                    case 'travel':

                        console.log('Called command/travel');

                        //Dont set callback ID here, no interactive message to return
                        return gameContext.characterTravel(requestSlackUserID, requestSlackChannelID);

                        break;

                    case 'name':

                        console.log('Called command/name');

                        //Dont set callback ID here, no interactive message to return
                        return gameContext.characterName(requestSlackUserID, slackTextInput);

                        break;
                }

                break;

            case 'actionList':

                switch (userSelection){

                    case 'Shop':

                        console.log('called actionList/shop');

                        slackTemplate = gameContext.shopList(requestSlackChannelID);

                        //TODO need to iterate through all attachments adding the same callback to all

                        //Previous callback includes the menu selection was made from, now add the selection & the next menu
                        slackTemplate.attachments[1].callback_id = requestCallback + ':Shop/shopList';
                        slackTemplate.attachments[2].callback_id = requestCallback + ':Shop/shopList';

                        return slackTemplate;

                        break;
                }

                break;

            case 'shopList':

                console.log('called shopList');

                //Create a local itemc
                var localItem = new Item(gameContext.state, requestActionValue);

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
                slackTemplate.attachments[0].callback_id = requestCallback + ':' + localItem.id + '/itemDetail';

                return slackTemplate;

                break;

            case 'itemDetail':

                console.log('called itemDetail');

                switch (userSelection){

                    case 'yes':

                        console.log('called itemDetail/yes');

                        //Get the item ID from the callback, it is found in the 2nd to last element of the parsed callback
                        var itemSelection = slackCallbackElements[slackCallbackElements.length - 2];

                        var valueSelection = itemSelection.split(":");

                        var itemID = valueSelection[valueSelection.length - 1];

                        return localCharacter.purchaseItem(new Item(gameContext.state, itemID));

                        break;

                    /*
                     case 'no':

                     console.log('called itemDetail/no');

                     //Return the player to item selection menu
                     slackTemplate = gameContext.shopList(requestSlackChannelID);

                     console.log('callback string: ', JSON.stringify(slackCallbackElements));

                     //Overwrite the callback to "backtrack" and get rid of the previous selection path
                     slackTemplate.attachments[0].callback_id = 'actionList:Shop/shopList';

                     return slackTemplate;

                     break;*/
                }

                break;

            case 'characterProfile':

                switch (userSelection) {

                    case 'Inventory':

                        console.log('called characterProfile/Inventory');

                        slackTemplate = slackTemplates.itemList;

                        //Pass in the character's unequipped inventory array
                        slackTemplate.attachments[0].actions[0].options = gameContext.getItemList(localCharacter.props.inventory.unequipped);

                        //Previous callback includes the menu selection was made from, now add the selection & the next menu
                        slackTemplate.attachments[0].callback_id = requestCallback + ':Inventory/itemDetail';

                        return slackTemplate;

                        break;

                    case 'Equipment':

                        console.log('called characterProfile/Equipment');

                        slackTemplate = slackTemplates.itemList;

                        //Pass in the character's unequipped inventory array
                        slackTemplate.attachments = gameContext.getEquipmentList(localCharacter.props.inventory.equipped);

                        console.log('Equipment template: ', JSON.stringify(slackTemplate.attachments));

                        //Previous callback includes the menu selection was made from, now add the selection & the next menu
                        slackTemplate.attachments[0].callback_id = requestCallback + ':Equipment/itemDetail';

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

                switch (userSelection) {

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

                switch (userSelection) {

                    case 'equipment-list':

                        //Load the item profile view

                        break;

                    case 'back-button':

                        //Load the character profile view

                        break;
                }

                break;

            default:

                console.log('callback not supported from context: ', selectionContext);

                break;
        }
    }


}