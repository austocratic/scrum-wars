"use strict";

const _ = require('lodash');

//Models
const Game = require('../models/Game').Game;
const Character = require('../models/Character').Character;
const User = require('../models/User').User;
const Class = require('../models/Class').Class;
const Zone = require('../models/Zone').Zone;
const Match = require('../models/Match').Match;
const Permission = require('../models/Permission').Permission;

const command = require('./gameContextControllers/command');
const { action, generate, profile, travel, name, turn, match } = command;

const selectActionMenu = require('./gameContextControllers/selectActionMenu');
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
        name: name,
        turn: turn,
        match: match
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
        processActionOnTarget: require('./gameContextControllers/selectActionTarget').processActionOnTarget
    },
    generateCharacterConfirmation: {
        yes: require('./gameContextControllers/generateCharacterConfirmation').yes,
        no: require('./gameContextControllers/generateCharacterConfirmation').no
    },
    selectCharacterClassMenu: {
        classSelection: require('./gameContextControllers/selectCharacterClassMenu').classSelection,
        classDetailMenu: require('./gameContextControllers/selectCharacterClassMenu').classDetailMenu
    },
    classDetailMenu: {
        //yes: require('./gameContexts/itemDetailMenu').yes,
        //equip: require('./gameContexts/itemDetailMenu').equip,
        //unequip: require('./gameContexts/itemDetailMenu').unequip
    },
    selectGenderMenu: {
        genderSelection: require('./gameContextControllers/selectGenderMenu').genderSelection
    },
    travelConfirmation: {
        yes: require('./gameContextControllers/travelConfirmation').yes,
        no: require('./gameContextControllers/travelConfirmation').no
    },
    characterProfileMenu: {
        inventory: require('./gameContextControllers/characterProfileMenu').inventory,
        equipment: require('./gameContextControllers/characterProfileMenu').equipment,
        exit: require('./gameContextControllers/characterProfileMenu').exit
    },
    shopMainMenu: {
        purchaseButton: require('./gameContextControllers/shopMainMenu').purchaseButton,
        sellButton: require('./gameContextControllers/shopMainMenu').sellButton
    },
    shopPurchaseMenu: {
        itemList: require('./gameContextControllers/shopPurchaseMenu').itemList
    },
    shopSellMenu: {
        itemList: require('./gameContextControllers/shopSellMenu').itemList
    },
    selectEquipmentMenu: {
        equipmentSelection: require('./gameContextControllers/selectEquipmentMenu').equipmentSelection
    },
    selectInventoryMenu: {
        inventorySelection: require('./gameContextControllers/selectInventoryMenu').inventorySelection
    },
    itemDetailMenu: {
        yesButton: require('./gameContextControllers/itemDetailMenu').yesButton,
        yesSellButton: require('./gameContextControllers/itemDetailMenu').yesSellButton,
        equip: require('./gameContextControllers/itemDetailMenu').equip,
        unequip: require('./gameContextControllers/itemDetailMenu').unequip
    },
    selectCharacterAvatarMenu: {
        more: require('./gameContextControllers/selectCharacterAvatarMenu').more,
        selection: require('./gameContextControllers/selectCharacterAvatarMenu').selection
    }
};

const processRequest = (gameContext, userSelection, opts) => {
    console.log('slackRequest.processRequest()');

    let actualFn;

    console.log("DEBUG gameContext: ", gameContext);
    console.log('DEBUG userSelection: ', userSelection);

    if (!contextsAndActions[gameContext]){
        return {"text": "ERROR context not configured in processRequest: ", gameContext}
    }

    //Build the response function.  If response not available, return an error message
    actualFn = contextsAndActions[gameContext][userSelection] || (()=>{ return {"text": `ERROR, button ${userSelection} is not yet setup for context ${gameContext}!`}});

        //console.log("DEBUG actualFn: ", actualFn)
    if (typeof actualFn === 'function') {
        return actualFn(opts);
    }
};


module.exports = {
    processRequest
};

