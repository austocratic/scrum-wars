"use strict";

//Controllers
const actionController = require('./actionController');
const modifyCallbackForBack = require('./backButton').modifyCallbackForBack;
const modifyUserActionNameSelection = require('./backButton').modifyUserActionNameSelection;

const _ = require('lodash');

//Models
const Game = require('../models/Game').Game;
const Character = require('../models/Character').Character;
const User = require('../models/User').User;
const Class = require('../models/Class').Class;
const Zone = require('../models/Zone').Zone;
const Match = require('../models/Match').Match;
const Permission = require('../models/Permission').Permission;

const command = require('./gameContexts/command');
const { action, generate, profile, travel, name } = command;

const selectActionMenu = require('./gameContexts/selectActionMenu');
const { shop, quickStrike, arcaneBolt, lifeTap, defensiveStance, balancedStance,
    offensiveStance, forkedLightning, intoShadow, savageStrike, backstab, poisonedBlade,
    whirlwind, cleave, firestorm
} = selectActionMenu;

//Route the slackRequest
const contextsAndActions = {
    command: {
        action: action,
        generate: generate,
        profile: profile,
        travel: travel,
        name: name
    },
    selectActionMenu: {
        shop: shop,
        quickStrike: quickStrike,
        arcaneBolt: arcaneBolt,
        lifeTap: lifeTap,
        defensiveStance: defensiveStance,
        balancedStance: balancedStance,
        offensiveStance: offensiveStance,
        forkedLightning: forkedLightning,
        intoShadow: intoShadow,
        savageStrike: savageStrike,
        backstab: backstab,
        poisonedBlade: poisonedBlade,
        whirlwind: whirlwind,
        cleave: cleave,
        firestorm: firestorm
    },
    selectActionTarget: {
        processActionOnTarget: require('./gameContexts/selectActionTarget').processActionOnTarget
    },
    generateCharacterConfirmation: {
        yes: require('./gameContexts/generateCharacterConfirmation').yes,
        no: require('./gameContexts/generateCharacterConfirmation').no
    },
    selectCharacterClassMenu: {
        classSelection: require('./gameContexts/selectCharacterClassMenu').classSelection,
        classDetailMenu: require('./gameContexts/selectCharacterClassMenu').classDetailMenu
    },
    classDetailMenu: {
        //yes: require('./gameContexts/itemDetailMenu').yes,
        //equip: require('./gameContexts/itemDetailMenu').equip,
        //unequip: require('./gameContexts/itemDetailMenu').unequip
    },
    selectGenderMenu: {
        genderSelection: require('./gameContexts/selectGenderMenu').genderSelection
    },
    travelConfirmation: {
        yes: require('./gameContexts/travelConfirmation').yes,
        no: require('./gameContexts/travelConfirmation').no
    },
    characterProfileMenu: {
        inventory: require('./gameContexts/characterProfileMenu').inventory,
        equipment: require('./gameContexts/characterProfileMenu').equipment,
        exit: require('./gameContexts/characterProfileMenu').exit
    },
    shopMainMenu: {
        purchaseButton: require('./gameContexts/shopMainMenu').purchaseButton,
        sellButton: require('./gameContexts/shopMainMenu').sellButton
    },
    shopPurchaseMenu: {
        itemList: require('./gameContexts/shopPurchaseMenu').itemList
    },
    selectEquipmentMenu: {
        equipmentSelection: require('./gameContexts/selectEquipmentMenu').equipmentSelection
    },
    selectInventoryMenu: {
        inventorySelection: require('./gameContexts/selectInventoryMenu').inventorySelection
    },
    itemDetailMenu: {
        yesButton: require('./gameContexts/itemDetailMenu').yesButton,
        equip: require('./gameContexts/itemDetailMenu').equip,
        unequip: require('./gameContexts/itemDetailMenu').unequip
    },
    selectCharacterAvatarMenu: {
        more: require('./gameContexts/selectCharacterAvatarMenu').more,
        selection: require('./gameContexts/selectCharacterAvatarMenu').selection
    }
};

const processSlashCommand = async (req) => {
    console.log('slackRequest.processSlashCommand()');

    let payload;

    if (req.body.payload){
        payload = req.body.payload
    } else {
        payload = req.body
    }

    console.log('DEBUG payload: ', payload);

    //Create a game object, initiate, refresh
    let game = await beginRequest();

    console.log('slackRequest.processSlashCommand() passed beginRequest()');

    //See if slack user is available in DB
    let slackRequestUserID = _.find(game.state.user, {'slack_user_id': payload.user_id});

    //If Slack user is not available in the DB, add them
    if (!slackRequestUserID){
        console.log('Requesting user does not exist, adding');
        game.createUser(payload.user_id);
        console.log('game.users after user added: ', game.state.user);
    }

    let slackResponseTemplateReturned = getSlashCommandResponse(payload, game);

    await endRequest(game);
    
    return slackResponseTemplateReturned;
};

const processInteractiveMessage = async (req) => {
    console.log('slackRequest.processInteractiveMessage()');

    let payload;

    function tryToParseJSON(input){
        try {
            return JSON.parse(input);
        } catch(err){
            return input
        }
    }

    if (tryToParseJSON(req.body.payload)){
        payload = tryToParseJSON(req.body.payload)
    } else {
        payload = tryToParseJSON(req.body)
    }

    let game = await beginRequest();

    let slackResponseTemplateReturned = getInteractiveMessageResponse(payload, game);

    await endRequest(game);

    return slackResponseTemplateReturned;
};

const beginRequest = async () => {
    console.log('slackRequest.beginRequest()');

    let game = new Game();

    //Set the game state locally
    await game.getState();

    //Calculate properties in memory
    game.initiateRequest();
    
    //Refresh the game (check for new turn, player deaths, ect.)
    game.refresh();

    return game;
};

const getSlashCommandResponse = (payload, game) => {
    console.log('slackRequest.getSlashCommandResponse()');

    //Declare a user selection based on the command entered in slack (trim the "/")
    let userSelection = payload.command.slice(1, payload.command.length);

    //Declare a user based on the slack ID making the request
    let user = new User(game.state, payload.user_id);

    //Declare a permission based on user's permission
    let permission = new Permission(game.state, user.props.permission_id);

    //If user's permission can not access that slash command, return an error
    if (!permission.canAccessSlashCommand(userSelection)){
        return {
            "text": "Sorry traveler, but I fear you can't take actions in this land"
        }
    }

    let slackRequestChannelID = payload.channel_id;
    let slackRequestCommand = 'command';
    let slackCallback = slackRequestCommand;
    let slackRequestText = payload.text;

    //Setup local game objects to send to request processor
    let slackResponseTemplate = {};
    let requestZone = new Zone(game.state, slackRequestChannelID);
    let currentMatch = new Match(game.state, game.getCurrentMatchID());

    let playerCharacter, characterClass;

    //Only instantiate playerCharacter if there is a character ID available to use
    if (user.props.character_id){
        playerCharacter = new Character(game.state, user.props.character_id);

        //In a few situations, the playerCharacter does not have a class_id yet (i.e: before the user has selected a class.  Default to undefined
        if (playerCharacter.props.class_id){
            characterClass = new Class(game.state, playerCharacter.props.class_id);
        }
    }

    return processRequest(slackRequestCommand, userSelection, {
        game,
        user,
        slackResponseTemplate,
        playerCharacter,
        userSelection,
        slackRequestCommand, //TODO for slash commands use the command
        slackCallback,
        requestZone,
        currentMatch,
        characterClass,
        slackRequestText
    });
};

const getInteractiveMessageResponse = (payload, game) => {
    console.log('slackRequest.getInteractiveMessageResponse()');

    let userActionNameSelection = payload.actions[0].name;
    let userActionValueSelection = getActionValue();

    function getActionValue(){
        if (payload.actions[0].value) {
            return payload.actions[0].value
        }
        //Action value dicates the specific selection from drop down menus
        return payload.actions[0].selected_options[0].value;
    }

    let slackCallbackElements = payload.callback_id.split("/");

    //The last element of the parsed callback string will be the context
    let gameContext = slackCallbackElements[slackCallbackElements.length - 1];

    //First check to see if the player selected "back".  If so. modify the callback to change the route
    let slackCallback;
    if (userActionNameSelection === "back"){
        userActionNameSelection = modifyUserActionNameSelection(payload.callback_id);
        slackCallback = modifyCallbackForBack(payload.callback_id);
    } else {
        //Add the slack attachment name & value into the callback
        slackCallback = `${payload.callback_id}:${userActionNameSelection}:${userActionValueSelection}/`;
    }

    let slackRequestCommand = payload.command;
    let slackResponseTemplate = {};
    let user = new User(game.state, payload.user.id);
    let requestZone = new Zone(game.state, payload.channel.id);
    let currentMatch = new Match(game.state, game.getCurrentMatchID());

    let playerCharacter, characterClass;

    //Only instantiate playerCharacter if there is a character ID available to use
    if (user.props.character_id){
        playerCharacter = new Character(game.state, user.props.character_id);

        //In a few situations, the playerCharacter does not have a class_id yet (i.e: before the user has selected a class.  Default to undefined
        if (playerCharacter.props.class_id){
            characterClass = new Class(game.state, playerCharacter.props.class_id);
        }
    }

    return processRequest(gameContext, userActionNameSelection, {
        game,
        user,
        slackResponseTemplate,
        playerCharacter,
        userActionValueSelection,
        userActionNameSelection,
        slackRequestCommand,
        slackCallback,
        requestZone,
        currentMatch,
        characterClass
    });
};

const endRequest = async (game) => {
    console.log('slackRequest.endRequest()');

    //Overwrites with updated local props
    return await game.updateState();
};



const processRequest = (action, userSelection, opts) => {
    console.log('slackRequest.processRequest()');

    //console.log('DEBUG action: ', action);
    //console.log('DEBUG userSelection: ', userSelection);
    let actualFn;
    try {
        //For some game contexts, I don't have individual functions for each selection.
        //In these cases, the same function will be invoked regardless of selection
        //Therefore, first set the function based on [action], then if there is a matching [userSelection], overwrite the function

        actualFn = contextsAndActions[action];

        if (typeof actualFn === 'function') {
            return actualFn(opts);
        }

        actualFn = contextsAndActions[action][userSelection];

    } catch(err) {
        // invalid action and user selection
        console.log('INVALID action & user selection: ', err)
    }
    if (typeof actualFn === 'function') {
        return actualFn(opts);
    }
};



module.exports = {
beginRequest,
endRequest,
processRequest,
processSlashCommand,
processInteractiveMessage,
getInteractiveMessageResponse,
getSlashCommandResponse
};

