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

//TODO this seems weird to have in the slackRequest file, maybe move when I refactor this file
var game = new Game();



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

    //var game = new Game();

    //Set the game state locally
    await game.getState();

    //Calculate properties in memory
    game.inititateRequest();

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
    game.inititateRequest()

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
    //console.log('called getResponseTemplate, requestSlackUserID: ', requestSlackUserID);
    //console.log('called getResponseTemplate, requestSlackChannelID: ', requestSlackChannelID);
    //console.log('called getResponseTemplate, gameContext: ', gameContext);
    //console.log('called getResponseTemplate, requestTextInput: ', requestTextInput);

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

                        return slackTemplate;

                        break;

                    case 'profile':
                        console.log('Called command/profile');
                        
                        slackTemplate = gameContext.characterProfile(requestSlackUserID, requestSlackChannelID);

                        updatedCallback = 'command:profile/characterProfile';

                        slackTemplate.attachments = getAttachmentWithCallbacks(slackTemplate.attachments, updatedCallback);

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

                        //Return a class selection template with all available classes from the DB
                        slackTemplate = gameContext.getCharacterClasses();

                        updatedCallback = requestCallback + ':yes/characterClassList';

                        slackTemplate.attachments = getAttachmentWithCallbacks(slackTemplate.attachments, updatedCallback);

                        return slackTemplate;
                        
                    break;

                    case 'no':
                        console.log('Called generateCharacterConfirmation/no');
                        return slackTemplates.generateCharacterConfirmationDecline;
                        
                    break;
                    
                }
                
                break;
            
            //Choose male or female
            case 'selectGender':

                //Mutate the object
                localCharacter.updateProperty('gender', userSelection);

                //Return a class selection template with all available classes from the DB
                //slackTemplate = gameContext.getCharacterClasses();

                let avatarList = {
                    'text': 'What does your character look like?'
                };

                //TODO hard coded first page length with .slice(1, 6), need to move to config
                let truncFileList;
                if (localCharacter.props.gender === 'male'){
                    truncFileList = gameContext.maleAvatarPaths.slice(1, 6);
                }
                if (localCharacter.props.gender === 'female'){
                    truncFileList = gameContext.femaleAvatarPaths.slice(1, 6);
                }

                avatarList.attachments = truncFileList.map( eachFilePath =>{
                    console.log('eachFilePath: ', eachFilePath);
                    return {
                        "text": "",
                        "image_url": 'https://scrum-wars.herokuapp.com/' + eachFilePath,
                        "actions":[{
                            "name": "selection",
                            "text": "Select",
                            "style": "default",
                            "type": "button",
                            "value": eachFilePath
                        }]
                    }
                });

                //Add a more button to the attachment array
                avatarList.attachments.push({
                    "text": "",
                    "image_url": '',
                    "actions": [
                        {
                            "name": "more",
                            "text": "More",
                            "style": "default",
                            "type": "button",
                            "value": 6
                        }
                    ]
                });

                console.log('avatarList.attachments: ', avatarList.attachments);

                updatedCallback = requestCallback + ':' + userSelection + '/avatarList';

                avatarList.attachments = getAttachmentWithCallbacks(avatarList.attachments, updatedCallback);

                return avatarList;

                break;

            case 'characterClassList':
                console.log('Called characterClassList');

                // *****************Based on class selection update DB stats*******************

                let localCharacterClass = new Class(gameContext.state, userSelection);

                //Array of action IDs
                let characterActions = localCharacterClass.props.action_id.map( eachActionID =>{
                    return {
                        action_id: eachActionID,
                        turn_used: 0,
                        turn_available: 0,
                        is_available: 1
                    }
                });

                let updates = {
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

                // *****************Return the gender selection menu*******************

                slackTemplate = slackTemplates.genderList;
                updatedCallback = requestCallback + ':' + userSelection + '/selectGender';

                slackTemplate.attachments = getAttachmentWithCallbacks(slackTemplate.attachments, updatedCallback);

                return slackTemplate;

                break;
            
            case 'avatarList':
                
                switch (userSelection){
                    
                    case 'more':
                        console.log('Called avatarList/more');

                        //TODO hard coded +6 into pagination calculation.  Need to set via config variable
                        let attachmentsPerPage = 6;

                        let numericRequestActionValue = parseFloat(requestActionValue);

                        //Determine the end of the current page (if more is selected, pass that as the next value
                        let nextPaginationEnd = numericRequestActionValue + attachmentsPerPage;

                        //Determine the beginning of the previous page (this will be used to determine starting point of previous page selection)
                        let previousPaginationBegin = numericRequestActionValue - attachmentsPerPage;

                        let avatarList = {
                            'text': 'What does your character look like?',
                            'attachments': []
                        };

                        //console.log('localCharacter.props.gender: ', localCharacter.props.gender);

                        //TODO hard coded first page length with .slice(1, 6), need to move to config
                        let avatarPathArray, truncFileList;
                        //console.log('truncFileList before being set should be empty: ', truncFileList);
                        if (localCharacter.props.gender === 'male'){

                            console.log('character is male, requestActionValue: ', requestActionValue);
                            console.log('character is male, paginationEnd: ', nextPaginationEnd);

                            //Path array is reference later to determine whether or not to display paginate button
                            avatarPathArray = gameContext.maleAvatarPaths;
                            truncFileList = avatarPathArray.slice(requestActionValue, nextPaginationEnd);
                        }
                        if (localCharacter.props.gender === 'female'){

                            //Path array is reference later to determine whether or not to display paginate button
                            avatarPathArray = gameContext.femaleAvatarPaths;
                            truncFileList = avatarPathArray.slice(requestActionValue, nextPaginationEnd);
                        }

                        //console.log('avatarList/more truncFileList: ', truncFileList);

                        avatarList.attachments = truncFileList.map( eachFilePath =>{
                            console.log('eachFilePath: ', eachFilePath);
                            return {
                                "text": "",
                                "image_url": 'https://scrum-wars.herokuapp.com/' + eachFilePath,
                                "actions":[{
                                    "name": "selection",
                                    "text": "Select",
                                    "style": "default",
                                    "type": "button",
                                    "value": eachFilePath
                                }]
                            }
                        });

                        avatarList.attachments.push({
                            "text": "",
                            "image_url": '',
                            "actions": []
                        });

                        //Get the index of the navigations buttins attachment so that buttons can be pushed into that index
                        let navigationButtonAttachmentIndex = avatarList.attachments.length - 1;

                        //If there is at least one value between 0 and current page beginning, add a previous button
                        //Add 'previous' button to the attachment array
                        if (numericRequestActionValue > 0) {
                            avatarList.attachments[navigationButtonAttachmentIndex].actions.push(
                                {
                                    "name": "more",
                                    "text": "Previous",
                                    "style": "default",
                                    "type": "button",
                                    "value": previousPaginationBegin
                                }
                            );
                        }

                        //If there is at least one value after the current page end, add a next button
                        //Add 'more' button to the attachment array
                        if (nextPaginationEnd < avatarPathArray.length) {
                            avatarList.attachments[navigationButtonAttachmentIndex].actions.push(
                                {
                                    "name": "more",
                                    "text": "More",
                                    "style": "default",
                                    "type": "button",
                                    "value": nextPaginationEnd
                                }
                            );
                        }

                        //REMOVING callback update.
                        updatedCallback = requestCallback;

                        getAttachmentWithCallbacks(avatarList.attachments, updatedCallback);

                        return avatarList;

                        break;

                    case 'selection':
                        console.log('Called avatarList/selection');

                        //store the file path in the character's profile
                        localCharacter.updateProperty('avatar', requestActionValue);

                        return {
                            "text": "You prepare to set out on your journey, but first, what is your name? (type /name ___ to set your name)"
                        };

                        break;
                }

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
                localItem = new Item(gameContext.state, requestActionValue);

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

                var itemSelection, valueSelection, itemID;
                
                switch (userSelection){

                    case 'yes':

                        console.log('called itemDetail/yes');

                        //Get the item ID from the callback, it is found in the 2nd to last element of the parsed callback
                        itemSelection = slackCallbackElements[slackCallbackElements.length - 2];

                        valueSelection = itemSelection.split(":");

                        itemID = valueSelection[valueSelection.length - 1];

                        return localCharacter.purchaseItem(new Item(gameContext.state, itemID));

                        break;

                    case 'equip':
                        console.log('called itemDetail/equip');

                        //Get the item ID from the callback, it is found in the 2nd to last element of the parsed callback
                        itemSelection = slackCallbackElements[slackCallbackElements.length - 2];

                        valueSelection = itemSelection.split(":");

                        itemID = valueSelection[valueSelection.length - 1];

                        localItem = new Item(gameContext.state, itemID);
                        
                        let responseText = {
                            text: 'You equip ' + localItem.props.name
                        };
                        
                        //Verify that the character does not have an item equipped in any of the new item's slots
                        localItem.props.equipment_slot_id.forEach( eachEquipmentSlotID =>{

                            let equipmentInSlot = localCharacter.getEquipmentInSlot(eachEquipmentSlotID);

                            if (equipmentInSlot.length === 0){
                                localCharacter.equipItem(localItem);
                                
                                responseText = 'You can not equip that item because you already have an item equipped in that slot!'
                            }
                        });

                        return responseText;
                        
                        break;
                    
                    case 'unequip':
                        console.log('called itemDetail/unequip');

                        //Get the item ID from the callback, it is found in the 2nd to last element of the parsed callback
                        itemSelection = slackCallbackElements[slackCallbackElements.length - 2];

                        valueSelection = itemSelection.split(":");

                        itemID = valueSelection[valueSelection.length - 1];
                        
                        localItem = new Item(gameContext.state, itemID);

                        localCharacter.unequipItem(itemID);
                        
                        return {
                            text: 'You unequip ' + localItem.props.name
                        };

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

                var localItem;
                
                switch (userSelection) {

                    case 'Exit':

                        console.log('called characterProfile/Exit');

                        return {
                            "text": ""
                        };

                        break;

                    case 'Inventory':

                        console.log('called characterProfile/Inventory');

                        let inventorySlackTemplate = slackTemplates.itemList;

                        let unequippedItemOptions =

                            //Get the unequipped items then map into slack format
                            localCharacter.getUnequippedItems()
                                .map(eachItem => {
                                    return {
                                        "text": eachItem.name,
                                        "value": eachItem.item_id
                                    }
                                });

                        //If the character has unequipped items return a drop down, else return "no items"
                        if (unequippedItemOptions.length > 0){

                            inventorySlackTemplate.attachments[1] =
                            {
                                "text": ""
                            };

                            inventorySlackTemplate.attachments[1].actions =
                                [{
                                    "name": "itemList",
                                    "type": "select",
                                    "options": unequippedItemOptions
                                }]
                        } else {
                            inventorySlackTemplate.attachments[1] =
                                {
                                    "text": "Your backpack is empty!"
                                }
                        }

                        updatedCallback = ':Inventory/inventoryList';

                        inventorySlackTemplate.attachments = getAttachmentWithCallbacks(inventorySlackTemplate.attachments, (requestCallback + updatedCallback));

                        return inventorySlackTemplate;

                        break;

                    case 'Equipment':

                        console.log('called characterProfile/Equipment');

                        let equipmentSlackTemplate = slackTemplates.equipmentList;

                        let equipmentSlackTemplateAttachments = gameContext.getEquippedItemView(localCharacter);

                        //getEquipmentList above overwrites attachments on template.  Add a back button here
                        equipmentSlackTemplateAttachments.push({
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

                        updatedCallback = ':Equipment/equipmentList';

                        let updatedAttachments = getAttachmentWithCallbacks(equipmentSlackTemplateAttachments, (requestCallback + updatedCallback));

                        equipmentSlackTemplate.attachments = updatedAttachments;

                        return equipmentSlackTemplate;

                        break;
                }

                break;

            case 'inventoryList':

                console.log('called inventoryList');

                //Create a local item
                localItem = new Item(gameContext.state, requestActionValue);

                //Create an item detail view template
                slackTemplate = localItem.getDetailView();

                console.log('shopList slackTemplate: ', JSON.stringify(slackTemplate));

                //Add purchase buttons to the bottom of the template
                slackTemplate.attachments[0].actions = [
                    {
                        "name": 'equip',
                        "text": "Equip Item",
                        "type": "button",
                        "value": localItem.id
                    },
                    {
                        "name": "back",
                        "text": "Back",
                        "type": "button",
                        "value": "no"
                    }];

                //Previous callback includes the menu selection was made from, now add the selection & the next menu
                slackTemplate.attachments[0].callback_id = requestCallback + ':' + localItem.id + '/itemDetail';

                return slackTemplate;

                break;

            case 'equipmentList':

                console.log('called equipmentList');
                
                //Create a local item
                localItem = new Item(gameContext.state, requestActionValue);

                //Create an item detail view template
                slackTemplate = localItem.getDetailView();

                console.log('shopList slackTemplate: ', JSON.stringify(slackTemplate));

                //Add purchase buttons to the bottom of the template
                slackTemplate.attachments[0].actions = [
                    {
                        "name": 'unequip',
                        "text": "Unequip Item",
                        "type": "button",
                        "value": localItem.id
                    },
                    {
                        "name": "back",
                        "text": "Back",
                        "type": "button",
                        "value": "no"
                    }];

                //Previous callback includes the menu selection was made from, now add the selection & the next menu
                slackTemplate.attachments[0].callback_id = requestCallback + ':' + localItem.id + '/itemDetail';

                return slackTemplate;

                break;

            default:

                console.log('callback not supported from context: ', selectionContext);

                break;
        }
    }


}

/*
module.exports = {
    getResponseTemplate: getResponseTemplate
};
*/
