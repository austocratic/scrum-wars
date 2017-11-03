"use strict";

//Controllers
const actionController = require('./actionController');
const modifyCallbackForBack = require('./backButton').modifyCallbackForBack;
const modifyUserActionNameSelection = require('./backButton').modifyUserActionNameSelection;

//Models
var Game = require('../models/Game').Game;
var Item = require('../models/Item').Item;
var Character = require('../models/Character').Character;
var User = require('../models/User').User;
var Class = require('../models/Class').Class;
var Zone = require('../models/Zone').Zone;
var Action = require('../models/Action').Action;
var Match = require('../models/Match').Match;

var slackTemplates = require('../slackTemplates');

const command = require('./gameContexts/command');
const { action, generate, profile, travel, name } = command;

const selectActionMenu = require('./gameContexts/selectActionMenu');
const { shop, quickStrike, arcaneBolt, lifeTap, defensiveStance, balancedStance,
    offensiveStance, forkedLightning, intoShadow, savageStrike, backstab, poisonedBlade, whirlwind, cleave
} = selectActionMenu;

//Route the slackRequest
const actionsAndThingsContext = {
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
        cleave: cleave
    },
    selectActionTarget: {
        processActionOnTarget: require('./gameContexts/selectActionTarget').processActionOnTarget
    },
    generateCharacterConfirmation: {
        yes: require('./gameContexts/generateCharacterConfirmation').yes,
        no: require('./gameContexts/generateCharacterConfirmation').no
    },
    selectCharacterClassMenu: {
        classSelection: require('./gameContexts/selectCharacterClassMenu').classSelection
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
    selectEquipmentMenu: {
        equipmentSelection: require('./gameContexts/selectEquipmentMenu').equipmentSelection
    },
    selectInventoryMenu: {
        inventorySelection: require('./gameContexts/selectInventoryMenu').inventorySelection
    },
    selectItemShopMenu: {
        selectItem: require('./gameContexts/selectItemShopMenu').selectItem
    },
    itemDetailMenu: {
        yes: require('./gameContexts/itemDetailMenu').yes,
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

    let game = await beginRequest();

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

    //TODO need validation to ensure request came from slack and is structured correctly

    let slackRequestUserID = payload.user_id;
    let slackRequestChannelID = payload.channel_id;
    let slackRequestCommand = 'command';
    let slackCallback = slackRequestCommand;
    let slackRequestText = payload.text;

    //Setup local game objects to send to request processor
    let slackResponseTemplate = {};
    let user = new User(game.state, slackRequestUserID);
    let playerCharacter = new Character(game.state, user.props.character_id);
    let requestZone = new Zone(game.state, slackRequestChannelID);
    let currentMatch = new Match(game.state, game.getCurrentMatchID());

    //In a few situations, the playerCharacter does not have a class_id yet (i.e: before the user has selected a class.  Default to undefined
    let characterClass = undefined;

    if (playerCharacter.props.class_id){
        characterClass = new Class(game.state, playerCharacter.props.class_id);
    }

    //Get the user selection by referencing the command property this represents which slash command was used.  Trim the "/" from the beginning of the command string
    let userSelection = payload.command.slice(1, payload.command.length);

    console.log('DEBUG slackSlashCommand, about to call processRequest');

    console.log('DEBUG slackRequestCommand: ', slackRequestCommand);
    console.log('DEBUG userSelection: ', userSelection);

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

    console.log('DEBUG ********************* payload: ', payload);

    let userActionNameSelection = payload.actions[0].name;

    console.log('DEBUG userActionNameSelection = ', userActionNameSelection);

    //First check to see if the player selected "back".  If so. modify the callback to change the route
    let slackCallback;
    if (userActionNameSelection === "back"){
        userActionNameSelection = modifyUserActionNameSelection(payload.callback_id);
        slackCallback = modifyCallbackForBack(payload.callback_id);
    } else {
        slackCallback = payload.callback_id;
    }

    let slackCallbackElements = slackCallback.split("/");

    function getActionValue(){
        if (payload.actions[0].value) {
            return payload.actions[0].value
        }
        //Action value dicates the specific selection from drop down menus
        return payload.actions[0].selected_options[0].value;
    }

    let slackRequestUserID = payload.user.id;
    let slackRequestChannelID = payload.channel.id;
    let slackRequestCommand = payload.command;

    //Setup local game objects to send to request processor
    let slackResponseTemplate = {};
    let user = new User(game.state, slackRequestUserID);
    let playerCharacter = new Character(game.state, user.props.character_id);

    let requestZone = new Zone(game.state, slackRequestChannelID);
    let currentMatch = new Match(game.state, game.getCurrentMatchID());

    //In a few situations, the playerCharacter does not have a class_id yet (i.e: before the user has selected a class.  Default to undefined
    let characterClass = undefined;

    if (playerCharacter.props.class_id){
        characterClass = new Class(game.state, playerCharacter.props.class_id);
    }

    let userActionValueSelection = getActionValue();
    let gameContext = slackCallbackElements[slackCallbackElements.length - 1]; //The last element of the parsed callback string will be the context

    return processRequest(gameContext, userActionNameSelection, {
        game,
        user,
        slackResponseTemplate,
        playerCharacter,
        userActionValueSelection,
        slackRequestCommand, //TODO for slash commands use the command
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

    console.log('DEBUG action: ', action);
    console.log('DEBUG userSelection: ', userSelection);
    let actualFn;
    try {
        //For some game contexts, I don't have individual functions for each selection.  
        //In these cases, the same function will be invoked regardless of selection
        //Therefore, first set the function based on [action], then if there is a matching [userSelection], overwrite the function

        actualFn = actionsAndThingsContext[action];

        if (typeof actualFn === 'function') {
            return actualFn(opts);
        }

        actualFn = actionsAndThingsContext[action][userSelection];

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

