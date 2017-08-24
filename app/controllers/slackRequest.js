"use strict";

var characterProfile = require('../menus/characterProfile').characterProfile;

//Controllers
var actionController = require('./actionController');

//Models
var Game = require('../models/Game').Game;
var Item = require('../models/Item').Item;
var Character = require('../models/Character').Character;
var User = require('../models/User').User;
var Class = require('../models/Class').Class;
var Zone = require('../models/Zone').Zone;
var Effect = require('../models/Effect').Effect;
var Action = require('../models/Action').Action;
var Match = require('../models/Match').Match;

var slackTemplates = require('../slackTemplates');

var moveCharacter = require('../components/zone/moveCharacter').moveCharacter;

/*
 1. Get game's current state
 2. Validate request
 3. Extract properties from request payload locally
 */


exports.slackSlashCommand = async (req, res, next) => {

    //TODO need validation to ensure request came from slack and is structured correctly
    
    console.log('called slackSlashCommand');

    var slackPayload = req.body;

    var slackUserID, slackChannelID, slackTextInput;

    console.log('slackPayload: ', slackPayload);

    //Get the user ID property (formatted differently based on /command or callback)
    
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

    //Calculate properties in memory
    game.inititate();

    //Function format: getResponseTemplate(requestCallback, requestActionName, requestActionValue, requestSlackUserID, requestSlackChannelID) {
    //requestCallback = "command" hard coded
    //requestActionName =
    //requestActionValue
    //requestSlackUserID
    //requestSlackChannelID
    var responseTemplate = getResponseTemplate('command', modifiedSlashCommand, 'requestActionValue not used', slackUserID, slackChannelID, game, slackTextInput);

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
    
    //Calculate properties in memory
    game.inititate()

    var responseTemplate = getResponseTemplate(slackCallback, actionName, actionValue, slackUserID, slackChannelID, game, undefined);

    console.log('responseTemplate to update: ', JSON.stringify(responseTemplate));

    //Overwrites with updated local props
    await game.updateState();

    //Send success response
    res.status(200).send(responseTemplate);
};

//Lookup the callback & name take an action and returns result
function getResponseTemplate(requestCallback, requestActionName, requestActionValue, requestSlackUserID, requestSlackChannelID, gameContext, requestTextInput) {

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

    var localZone = new Zone(gameContext.state, requestSlackChannelID);

    var localMatch = new Match(gameContext.state, gameContext.getCurrentMatchID());

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

    function getAttachmentWithCallbacks(attachmentsArray, callbackString){

        //Check if attachmentsArray is empty.  If it is, create a single attachment
        /*
        if (attachmentsArray.length === 0){
            attachmentsArray.push()
        }*/

        return attachmentsArray.map( eachAttachment =>{
            eachAttachment.callback_id = callbackString;

            return eachAttachment
        })
    }

    //Switch logic looks at the view & the button selected to return a template
    return responseTemplateSwitch(lastCallbackElement, requestActionName);

    //Switch logic to determine action
    function responseTemplateSwitch(selectionContext, userSelection){

        var updatedCallback;

        switch (selectionContext) {

            //Commands are generated by slash commands
            case 'command':

                switch (userSelection){

                    case 'action':

                        console.log('Called command/action');

                        //Is the character's current zone not equal to the requested zone?
                        if (localCharacter.props.zone_id !== localZone.id) {

                            console.log('hit zone id mismatch condition');

                            //Return mismatch template by passing in zone ids
                            slackTemplate = moveCharacter(localZone.id, localZone.props.name);

                            updatedCallback = 'command:action/travelConfirmation';

                            slackTemplate.attachments = getAttachmentWithCallbacks(slackTemplate.attachments, updatedCallback);

                            return slackTemplate;
                        }

                        slackTemplate = gameContext.getAvailableActions(requestSlackUserID, requestSlackChannelID);

                        updatedCallback = 'command:action/actionList';

                        slackTemplate.attachments = getAttachmentWithCallbacks(slackTemplate.attachments, updatedCallback);

                        return slackTemplate;

                    break;

                    case 'generate':

                        console.log('Called command/generate');
                        //Return the new character confirmation template
                        slackTemplate = slackTemplates.generateCharacterConfirmation;

                        updatedCallback = 'command:generate/generateCharacterConfirmation';

                        slackTemplate.attachments = getAttachmentWithCallbacks(slackTemplate.attachments, updatedCallback);

                        //slackTemplate.attachments[0].callback_id = 'command:generate/generateCharacterConfirmation';

                        return slackTemplate;

                        break;

                    case 'profile':

                        console.log('Called command/profile');
                        slackTemplate = gameContext.characterProfile(requestSlackUserID, requestSlackChannelID);

                        updatedCallback = 'command:profile/characterProfile';

                        slackTemplate.attachments = getAttachmentWithCallbacks(slackTemplate.attachments, updatedCallback);
                        //attachment 0 = character image
                        //attachment 1 = character stats
                        //slackTemplate.attachments[2].callback_id = 'command:profile/characterProfile';

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
                        return gameContext.characterName(requestSlackUserID, requestTextInput);

                        break;
                }

                break;
            
            case 'generateCharacterConfirmation':
                
                switch (userSelection) {
                    
                    case 'yes':
                        console.log('Called generateCharacterConfirmation/yes');
                        
                        //Archive the player's current character
                        //character.archive - this function should change the character's active property to 0
                        localCharacter.inactivate();
                        
                        //Create new character record
                        var newLocalCharacterID = gameContext.createCharacter(localUser.id);

                        //Update the user to new character
                        localUser.updateProperty('character_id', newLocalCharacterID);
                        
                        //var newLocalCharacter = new Character(gameContext.state, newLocalCharacterID);
                        
                        //console.log('newLocalCharacter props: ', JSON.stringify(newLocalCharacter.props));
                        
                        //Return a class selection template with all available classes from the DB

                        slackTemplate = gameContext.getCharacterClasses();

                        console.log('character class template: ', JSON.stringify(slackTemplate));

                        updatedCallback = requestCallback + ':yes/generateCharacterClassList';

                        slackTemplate.attachments = getAttachmentWithCallbacks(slackTemplate.attachments, updatedCallback);

                        return slackTemplate;
                        
                    break;

                    case 'no':
                        console.log('Called generateCharacterConfirmation/no');
                        slackTemplate = slackTemplates.generateCharacterConfirmationDecline;

                        return slackTemplate;
                        
                    break;
                    
                }
                
                break;

            case 'generateCharacterClassList':
                console.log('Called generateCharacterClassList');

                var localCharacterClass = new Class(gameContext.state, userSelection);

                //Array of action IDs
                var characterActions = localCharacterClass.props.action_id.map( eachActionID =>{
                    return {
                        action_id: eachActionID,
                        turn_used: 0,
                        turn_available: 0,
                        is_available: 1
                    }
                });

                var updates = {
                    "actions": characterActions,
                    "class_id": localCharacterClass.id,
                    "strength": localCharacterClass.props.starting_attributes.strength,
                    "toughness": localCharacterClass.props.starting_attributes.toughness,
                    "dexterity": localCharacterClass.props.starting_attributes.dexterity,
                    "intelligence": localCharacterClass.props.starting_attributes.intelligence,
                    "modified_strength": localCharacterClass.props.starting_attributes.strength,
                    "modified_toughness": localCharacterClass.props.starting_attributes.toughness,
                    "modified_dexterity": localCharacterClass.props.starting_attributes.dexterity,
                    "modified_intelligence": localCharacterClass.props.starting_attributes.intelligence
                };

                //Mutate the object
                Object.assign(localCharacter.props, updates);

                return slackTemplates.generateCharacterSuccess;

                break;

            case 'travelConfirmation':

                switch (userSelection){

                    case 'yes':
                        console.log('called travelConfirmation/yes');

                        return gameContext.characterTravel(requestSlackUserID, requestSlackChannelID);

                        break;

                    case 'no':
                        console.log('called travelConfirmation/no');

                        return slackTemplates.travelDialogueDecline;

                        break;
                }

                break;

            case 'actionList':

                //First check that the selected action is available this turn

                /* Temporarily removing availability check (to make testing easier)
                if (!localCharacter.isActionAvailable(userSelection, localMatch.props.number_turns)) {
                    return {
                        "text": "That action is not available this turn!"
                    }
                }*/

                var actionResponse;

                //Switch between different actions IDs
                switch (userSelection){

                    //Shop
                    case '-KkJVqtBIhpAKBfz9tcb':

                        console.log('called actionList/-KkJVqtBIhpAKBfz9tcb');

                        slackTemplate = gameContext.shopList(requestSlackChannelID);

                        updatedCallback = ':Shop/shopList';

                        slackTemplate.attachments = getAttachmentWithCallbacks(slackTemplate.attachments, (requestCallback + updatedCallback));

                        actionResponse = slackTemplate;

                        break;

                    //Tavern
                    case '-Kr9TRwZS7C9JHm1VzE3':

                        console.log('called actionList/-Kr9TRwZS7C9JHm1VzE3');

                        //slackTemplate = gameContext.shopList(requestSlackChannelID);

                        //updatedCallback = ':Shop/shopList';

                        //slackTemplate.attachments = getAttachmentWithCallbacks(slackTemplate.attachments, (requestCallback + updatedCallback));

                        //actionResponse = slackTemplate;

                        break;

                    //Quick Strike
                    //Return a target menu
                    case '-Kjpe29q_fDkJG-73AQO':
                        console.log('called actionList/-Kjpe29q_fDkJG-73AQO');

                        actionResponse = gameContext.getCharactersInZone(localZone.id, requestSlackUserID);

                        //Set the callback, will be assigned at end of switch
                        updatedCallback = (':' + userSelection + '/characterList');

                        break;

                    case '-KrJaBvyYDGrNVfcaAd0':
                        console.log('called actionList/-KrJaBvyYDGrNVfcaAd0');

                        actionResponse = gameContext.getCharactersInZone(localZone.id, requestSlackUserID);

                        //Set the callback, will be assigned at end of switch
                        updatedCallback = (':' + userSelection + '/characterList');
                        
                        break;

                    //Defensive Stance
                    //Up your AC, lower your attack
                    case '-KjpeJT7Oct3ZCtLhENO':
                        console.log('called actionList/-KjpeJT7Oct3ZCtLhENO');

                        var localAction = new Action(gameContext.state, userSelection);

                        targetCharacter = localCharacter;

                        var attack_action = new actionController.DefensiveStance(localCharacter, targetCharacter, localZone, localMatch, localAction);

                        attack_action.initiate();

                        //console.log('calling initiateAction, result: ', attack_action.initiate());

                        //Resolve action (mark it as used)
                        attack_action.updateAction();

                        return {
                            "text": "You enter a defensive stance!"
                        };
                        
                        break;

                    //Balanced Stance
                    //Reverse any other stances
                    case '-KqtOcn7MapqMfnGIZvo':
                        console.log('called actionList/-KqtOcn7MapqMfnGIZvo');

                        var localAction = new Action(gameContext.state, userSelection);

                        targetCharacter = localCharacter;

                        var attack_action = new actionController.BalancedStance(localCharacter, targetCharacter, localZone, localMatch, localAction);

                        attack_action.initiate();

                        //console.log('calling initiateAction, result: ', attack_action.initiate());

                        //Resolve action (mark it as used)
                        attack_action.updateAction();

                        return {
                            "text": "You enter a balanced stance!"
                        };

                        break;
                    //Life Tap
                    case '-KkOq-y2_zgEgdhY-6_U':
                        console.log('called actionList/-KkOq-y2_zgEgdhY-6_U');

                        actionResponse = gameContext.getCharactersInZone(localZone.id, requestSlackUserID);

                        //Set the callback, will be assigned at end of switch
                        updatedCallback = (':' + userSelection + '/characterList');

                        //return charactersInZone;

                        break;
                    //Forked Lightning
                    case '-KkdduB9XuB46EsxqwIX':
                        console.log('called actionList/-KkdduB9XuB46EsxqwIX');
                        
                        break;
                    //Into Shadow
                    case '-Kkdk_CD5vx8vRGQD268':
                        console.log('called actionList/-Kkdk_CD5vx8vRGQD268');

                        var localAction = new Action(gameContext.state, userSelection);

                        targetCharacter = localCharacter;

                        var attack_action = new actionController.IntoShadow(localCharacter, targetCharacter, localZone, localMatch, localAction);

                        attack_action.initiate();

                        //console.log('calling initiateAction, result: ', attack_action.initiate());

                        //Resolve action (mark it as used)
                        attack_action.updateAction();

                        return {
                            "text": "You fade into the shadows...."
                        };
                        
                        break;

                    //Backstab
                    //Return a target menu
                    case '-Kr3hnITyH9ZKx3VuZah':
                        console.log('called actionList/-Kr3hnITyH9ZKx3VuZah');

                        actionResponse = gameContext.getCharactersInZone(localZone.id, requestSlackUserID);

                        //Set the callback, will be assigned at end of switch
                        updatedCallback = (':' + userSelection + '/characterList');

                        break;
                    
                    default:
                        console.log('called actionList & hit default statement');

                        return {
                            "user_name": "System",
                            "text": "Error, that action is not supported"
                        };

                        break;
                }

                //Set the callback for all actions
                actionResponse.attachments = getAttachmentWithCallbacks(actionResponse.attachments, (requestCallback + updatedCallback));

                return actionResponse;

                break;

            case 'characterList':
                console.log('called characterList');

                //Characterlist can be called from several contexts.  Parse the prior screen to determine the context that it was called from
                var priorViewSelection = slackCallbackElements[slackCallbackElements.length - 2].split(":");

                var priorView = priorViewSelection[0];
                var priorSelection = priorViewSelection[1];

                console.log('priorView: ', priorView);
                console.log('priorSelection: ', priorSelection);

                var targetCharacter = new Character(gameContext.state, requestActionValue);
                
                var localAction = new Action(gameContext.state, priorSelection);

                //Look up what effect IDs

                switch(priorView){

                    case 'actionList':

                        switch(priorSelection){

                            //Quick Strike
                            case '-Kjpe29q_fDkJG-73AQO':
                                console.log('called actionList/-Kjpe29q_fDkJG-73AQO');

                                var attack_action = new actionController.QuickStrike(localCharacter, targetCharacter, localZone, localMatch, localAction);

                                console.log('calling initiateAction, result: ', attack_action.initiate());
                                
                                //Resolve action (mark it as used)
                                attack_action.updateAction();

                                break;
                            
                            //Arcane Bolt
                            case '-KrJaBvyYDGrNVfcaAd0':
                                console.log('called actionList/-Kjpe29q_fDkJG-73AQO');

                                var attack_action = new actionController.ArcaneBolt(localCharacter, targetCharacter, localZone, localMatch, localAction);

                                console.log('calling initiateAction, result: ', attack_action.initiate());

                                //Resolve action (mark it as used)
                                attack_action.updateAction();
                                
                                break;

                            //Life tap
                            case '-KkOq-y2_zgEgdhY-6_U':
                                console.log('called actionList/-KkOq-y2_zgEgdhY-6_U');

                                var attack_action = new actionController.LifeTap(localCharacter, targetCharacter, localZone, localMatch, localAction);

                                console.log('calling initiateAction, result: ', attack_action.initiate());

                                //Resolve action (mark it as used)
                                attack_action.updateAction();

                                break;
                            
                            //Backstab
                            case '-Kr3hnITyH9ZKx3VuZah':
                                console.log('called actionList/-Kr3hnITyH9ZKx3VuZah');

                                var attack_action = new actionController.Backstab(localCharacter, targetCharacter, localZone, localMatch, localAction);

                                console.log('calling initiateAction, result: ', attack_action.initiate());

                                //Resolve action (mark it as used)
                                attack_action.updateAction();
                                
                                break;
                            
                            default:

                                return {
                                    "text": "ERROR: Prior action is not supported, check slackRequest.js"
                                };

                                break;
                        }

                        return {
                            "text": 'actions complete'
                        };

                        break;
                }

                break;

            case 'shopList':
                console.log('called shopList');

                //Create a local item
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

                        updatedCallback = ':Inventory/itemDetail';

                        slackTemplate.attachments = getAttachmentWithCallbacks(slackTemplate.attachments, (requestCallback + updatedCallback));

                        //Previous callback includes the menu selection was made from, now add the selection & the next menu
                        //slackInventoryTemplate.attachments[0].callback_id = requestCallback + ':Inventory/itemDetail';
                        //slackInventoryTemplate.attachments[1].callback_id = requestCallback + ':Inventory/itemDetail';

                        //console.log('slackTemplate after callbacks set: ', JSON.stringify(slackInventoryTemplate));

                        return slackTemplate;

                        break;

                    case 'Equipment':

                        console.log('called characterProfile/Equipment');

                        slackTemplate = slackTemplates.itemList;

                        //Pass in the character's unequipped inventory array
                        //slackTemplate.attachments = gameContext.getEquipmentList(localCharacter.props.inventory.equipped);
                        var slackTemplateAttachments = gameContext.getEquipmentList(localCharacter.props.inventory.equipped);

                        //getEquipmentList above overwrites attachments on template.  Add a back button here
                        slackTemplateAttachments.push({
                            "text": "",
                            "fallback": "You are unable to go back",
                            "callback_id": "itemList",
                            "color": "#3AA3E3",
                            "attachment_type": "default",
                            "actions": [
                                {
                                    "name": "back",
                                    "text": "Back",
                                    "style": "",
                                    "type": "button",
                                    "value": "back"
                                }
                            ]
                        });

                        updatedCallback = ':Equipment/itemDetail';

                        var updatedAttachments = getAttachmentWithCallbacks(slackTemplateAttachments, (requestCallback + updatedCallback));

                        /*
                        var updatedAttachments = slackTemplateAttachments.map( singleAttachment =>{

                            singleAttachment.callback_id = requestCallback + ':Equipment/itemDetail';

                            return singleAttachment

                        });*/

                        slackTemplate.attachments = updatedAttachments;

                        console.log('Equipment template: ', JSON.stringify(slackTemplate.attachments));

                        //Previous callback includes the menu selection was made from, now add the selection & the next menu
                        //slackTemplate.attachments[0].callback_id = requestCallback + ':Equipment/itemDetail';
                        //slackTemplate.attachments[1].callback_id = requestCallback + ':Equipment/itemDetail';

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