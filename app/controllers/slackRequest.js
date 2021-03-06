"use strict";

const _ = require('lodash');

const command = require('./gameContextControllers/command');
const { action, generate, profile, travel, name, turn, match, ranking, list } = command;

const selectActionMenu = require('./gameContextControllers/selectActionMenu');
const { shop, shop1, craftersGuild, quickStrike, basicMelee, arcaneBolt, flameBurst, lifeTap, risingPunch, flurryOfFists, fistOfThunder, defensiveStance,
    balancedStance, inspiringShout, offensiveStance, axeorsShielding, coatOfBark, smokeBomb, forkedLightning, intoShadow, savageStrike,
    backstab, poisonedBlade, stingingBees, whirlwind, cleave, firestorm, roundingKick, minorHealing, meditation
} = selectActionMenu;

//Route the slackRequest
const contextsAndActions = {
    command: {
        action: action,
        generate: generate,
        profile: profile,
        travel: travel,
        name: name,
        ranking: ranking,
        list: list,
        turn: turn,
        match: match
    },
    selectActionMenu: {
        shop: shop,
        shop1: shop1,
        craftersGuild: craftersGuild,
        quickStrike: quickStrike,
        basicMelee: basicMelee,
        arcaneBolt: arcaneBolt,
        flameBurst: flameBurst,
        risingPunch: risingPunch,
        flurryOfFists: flurryOfFists,
        fistOfThunder: fistOfThunder,
        lifeTap: lifeTap,
        defensiveStance: defensiveStance,
        balancedStance: balancedStance,
        offensiveStance: offensiveStance,
        axeorsShielding: axeorsShielding,
        coatOfBark: coatOfBark,
        smokeBomb: smokeBomb,
        inspiringShout: inspiringShout,
        forkedLightning: forkedLightning,
        intoShadow: intoShadow,
        savageStrike: savageStrike,
        backstab: backstab,
        poisonedBlade: poisonedBlade,
        stingingBees: stingingBees,
        whirlwind: whirlwind,
        roundingKick, roundingKick,
        cleave: cleave,
        firestorm: firestorm,
        meditation: meditation,
        minorHealing: minorHealing
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
    breakMeditationConfirmation: {
        yes: require('./gameContextControllers/breakMeditationConfirmation').yes,
        no: require('./gameContextControllers/breakMeditationConfirmation').no
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
    krommMainMenu: {
        purchaseButton: require('./gameContextControllers/krommMainMenu').purchaseButton,
        sellButton: require('./gameContextControllers/krommMainMenu').sellButton
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
        paginate: require('./gameContextControllers/selectCharacterAvatarMenu').paginate,
        selection: require('./gameContextControllers/selectCharacterAvatarMenu').selection
    }
};

const processRequest = (gameContext, userSelection, opts) => {
    console.log(`slackRequest.processRequest() gameContext: ${gameContext} || userSelection: ${userSelection}`);

    let actionFn;

    if (!contextsAndActions[gameContext]){
        return {"text": "ERROR context not configured in processRequest: ", gameContext}
    }

    //Build the response function.  If response not available, return an error message
    actionFn = contextsAndActions[gameContext][userSelection] || (()=>{ return {"text": `ERROR, button ${userSelection} is not yet setup for context ${gameContext}!`}});

    if (typeof actionFn === 'function') {
        return actionFn(opts);
    }
};


module.exports = {
    processRequest
};

