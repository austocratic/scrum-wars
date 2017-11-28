"use strict";

const _ = require('lodash');

const NPC = require('../../models/NPC').NPC;
const Item = require('../../models/Item').Item;
const Action = require('../../models/Action').Action;
const Character = require('../../models/Character').Character;
const updateCallback = require('../../helpers').updateCallback;
const validateGameObjects = require('../../helpers').validateGameObjects;
const targetSelection = require('../targetSelection').getTargetSelectionMenu;

const actions = require('../actionControllers/actions/index');

const { DefensiveStance, BalancedStance, IntoShadow, Whirlwind, OffensiveStance, Firestorm } = actions;

const actionControllers = {
    defensiveStance: DefensiveStance,
    offensiveStance: OffensiveStance,
    balancedStance: BalancedStance,
    intoShadow: IntoShadow,
    whirlwind: Whirlwind,
    firestorm: Firestorm
};

//Shop is the only action not using the action controller
const shop = gameObjects => {
    console.log('Called selectActionMenu/shop');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'slackCallback',
        'slackResponseTemplate'
    ]);

    //Due to the DB data structure, I use _findKey()
    let npcID = _.findKey(gameObjects.game.state.npc, {zone_id: gameObjects.requestZone.id});

    let vendor = new NPC(gameObjects.game.state, npcID);

    gameObjects.slackResponseTemplate = {
        "text": "_You enter the general store and the merchant greets you warmly_ \nHello there traveler!  Welcome to my shop.  What can I interest you in?",
        "attachments": [
            {
                "fallback": "You are unable to choose an action",
                "callback_id": "",
                "color": gameObjects.game.menuColor,
                "attachment_type": "default",
                "image_url": "https://scrum-wars.herokuapp.com/public/images/fullSize/" + vendor.id + ".jpg",
                "actions": []
            },
            {
                "text": "",
                "fallback": "You are unable to go back",
                "callback_id": "",
                "color": gameObjects.game.menuColor,
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "shopPurchaseMenu",
                        "text": "Purchase Items",
                        "style": "",
                        "type": "button",
                        "value": "shopPurchaseMenu"
                    },
                    {
                        "name": "shopSellMenu",
                        "text": "Sell Items",
                        "style": "",
                        "type": "button",
                        "value": "shopSellMenu"
                    },
                    {
                        "name": "back",
                        "text": "Exit shop",
                        "style": "",
                        "type": "button",
                        "value": "back"
                    }
                ]
            }
        ]
    };

    //TODO broke up the callback update to two lines because I hope to use this as middleware soon
    let updatedCallback1 = `${gameObjects.slackCallback}:${gameObjects.userActionValueSelection}/`;

    gameObjects.slackCallback = updatedCallback1;
    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback1);

    console.log('DEBUG shop function attachment BEFORE: ', JSON.stringify(gameObjects.slackResponseTemplate.attachments));

    let updatedCallback2 = `${gameObjects.slackCallback}shopMainMenu`;
    
    //let updatedCallback = gameObjects.slackCallback + ':shop/shopMainMenu';

    gameObjects.slackResponseTemplate.attachments = updateCallback(gameObjects.slackResponseTemplate.attachments, updatedCallback2);

    console.log('DEBUG shop function attachment FINAL: ', JSON.stringify(gameObjects.slackResponseTemplate.attachments));

    return gameObjects.slackResponseTemplate;
};
const tavern = gameObjects => {

};
const defensiveStance = gameObjects => {
    console.log('Called selectActionMenu/defensiveStance');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'currentMatch' ,
        'userActionValueSelection'
    ]);
    
    //User selected a target character ID.  Create a character for that target
    //let targetCharacter = new Character(gameObjects.game.state, gameObjects.userActionValueSelection);
    gameObjects.targetCharacter = gameObjects.playerCharacter;
    
    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //If action is not available return action "unavailable" template
    if (!gameObjects.playerCharacter.isActionAvailable(gameObjects.actionTaken, gameObjects.currentMatch.props.number_turns)) {
        return {
            "text": `_${gameObjects.actionTaken.props.name} is still cooling down!_`
        }
    }

    //Declare the Class function without invoking
    const actionObjectToMake = actionControllers['defensiveStance'];

    //Invoke validation function using the classes's attached validation properties before instantiating the class
    validateGameObjects(gameObjects, actionObjectToMake.validations);

    let actionObject = new actionObjectToMake(gameObjects);

    actionObject.initiate();

    //Mark the action as used, pass in action id & turn number
    gameObjects.playerCharacter.updateActionUsed(actionObject.actionTaken.id, gameObjects.currentMatch.props.number_turns);

    return {
        "text": `_You perform ${actionObject.actionTaken.props.name}_`
    }
};
const offensiveStance = gameObjects => {
    console.log('Called selectActionMenu/offensiveStance');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'currentMatch' ,
        'userActionValueSelection'
    ]);

    //User selected a target character ID.  Create a character for that target
    //let targetCharacter = new Character(gameObjects.game.state, gameObjects.userActionValueSelection);
    gameObjects.targetCharacter = gameObjects.playerCharacter;

    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //If action is not available return action "unavailable" template
    if (!gameObjects.playerCharacter.isActionAvailable(gameObjects.actionTaken, gameObjects.currentMatch.props.number_turns)) {
        return {
            "text": `_${gameObjects.actionTaken.props.name} is still cooling down!_`
        }
    }

    //Declare the Class function without invoking
    const actionObjectToMake = actionControllers['offensiveStance'];

    //Invoke validation function using the classes's attached validation properties before instantiating the class
    validateGameObjects(gameObjects, actionObjectToMake.validations);

    let actionObject = new actionObjectToMake(gameObjects);

    actionObject.initiate();

    //Mark the action as used, pass in action id & turn number
    gameObjects.playerCharacter.updateActionUsed(actionObject.actionTaken.id, gameObjects.currentMatch.props.number_turns);

    return {
        "text": `_You perform ${actionObject.actionTaken.props.name}_`
    }
};
const balancedStance = gameObjects => {
    console.log('Called selectActionMenu/balancedStance');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'currentMatch' ,
        'userActionValueSelection'
    ]);

    //User selected a target character ID.  Create a character for that target
    //let targetCharacter = new Character(gameObjects.game.state, gameObjects.userActionValueSelection);
    gameObjects.targetCharacter = gameObjects.playerCharacter;

    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //If action is not available return action "unavailable" template
    if (!gameObjects.playerCharacter.isActionAvailable(gameObjects.actionTaken, gameObjects.currentMatch.props.number_turns)) {
        return {
            "text": `_${gameObjects.actionTaken.props.name} is still cooling down!_`
        }
    }

    //Declare the Class function without invoking
    const actionObjectToMake = actionControllers['balancedStance'];

    //Invoke validation function using the classes's attached validation properties before instantiating the class
    validateGameObjects(gameObjects, actionObjectToMake.validations);

    let actionObject = new actionObjectToMake(gameObjects);

    actionObject.initiate();

    //Mark the action as used, pass in action id & turn number
    gameObjects.playerCharacter.updateActionUsed(actionObject.actionTaken.id, gameObjects.currentMatch.props.number_turns);

    return {
        "text": `_You perform ${actionObject.actionTaken.props.name}_`
    }
};
const intoShadow = gameObjects => {
    console.log('Called selectActionMenu/intoShadow');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'currentMatch' ,
        'userActionValueSelection'
    ]);

    //User selected a target character ID.  Create a character for that target
    //let targetCharacter = new Character(gameObjects.game.state, gameObjects.userActionValueSelection);
    gameObjects.targetCharacter = gameObjects.playerCharacter;

    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //If action is not available return action "unavailable" template
    if (!gameObjects.playerCharacter.isActionAvailable(gameObjects.actionTaken, gameObjects.currentMatch.props.number_turns)) {
        return {
            "text": `_${gameObjects.actionTaken.props.name} is still cooling down!_`
        }
    }

    //Declare the Class function without invoking
    const actionObjectToMake = actionControllers['intoShadow'];

    //Invoke validation function using the classes's attached validation properties before instantiating the class
    validateGameObjects(gameObjects, actionObjectToMake.validations);

    let actionObject = new actionObjectToMake(gameObjects);

    actionObject.initiate();

    //Mark the action as used, pass in action id & turn number
    gameObjects.playerCharacter.updateActionUsed(actionObject.actionTaken.id, gameObjects.currentMatch.props.number_turns);

    return {
        "text": `_You perform ${actionObject.actionTaken.props.name}_`
    }
};
const whirlwind = gameObjects => {
    console.log('Called selectActionMenu/whirlwind');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'currentMatch' ,
        'userActionValueSelection'
    ]);

    //User selected a target character ID.  Create a character for that target
    //let targetCharacter = new Character(gameObjects.game.state, gameObjects.userActionValueSelection);
    gameObjects.targetCharacter = gameObjects.playerCharacter;

    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //If action is not available return action "unavailable" template
    if (!gameObjects.playerCharacter.isActionAvailable(gameObjects.actionTaken, gameObjects.currentMatch.props.number_turns)) {
        return {
            "text": `_${gameObjects.actionTaken.props.name} is still cooling down!_`
        }
    }

    //Declare the Class function without invoking
    const actionObjectToMake = actionControllers['whirlwind'];

    //Invoke validation function using the classes's attached validation properties before instantiating the class
    validateGameObjects(gameObjects, actionObjectToMake.validations);

    let actionObject = new actionObjectToMake(gameObjects);

    actionObject.initiate();

    //Mark the action as used, pass in action id & turn number
    gameObjects.playerCharacter.updateActionUsed(actionObject.actionTaken.id, gameObjects.currentMatch.props.number_turns);

    return {
        "text": `_You perform ${actionObject.actionTaken.props.name}_`
    }
};
const firestorm = gameObjects => {
    console.log('Called selectActionMenu/firestorm');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'currentMatch' ,
        'userActionValueSelection'
    ]);

    //User selected a target character ID.  Create a character for that target
    //let targetCharacter = new Character(gameObjects.game.state, gameObjects.userActionValueSelection);
    gameObjects.targetCharacter = gameObjects.playerCharacter;

    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //If action is not available return action "unavailable" template
    if (!gameObjects.playerCharacter.isActionAvailable(gameObjects.actionTaken, gameObjects.currentMatch.props.number_turns)) {
        return {
            "text": `_${gameObjects.actionTaken.props.name} is still cooling down!_`
        }
    }

    //Declare the Class function without invoking
    const actionObjectToMake = actionControllers['firestorm'];

    //Invoke validation function using the classes's attached validation properties before instantiating the class
    validateGameObjects(gameObjects, actionObjectToMake.validations);

    let actionObject = new actionObjectToMake(gameObjects);

    actionObject.initiate();

    //Mark the action as used, pass in action id & turn number
    gameObjects.playerCharacter.updateActionUsed(actionObject.actionTaken.id, gameObjects.currentMatch.props.number_turns);

    return {
        "text": `_You perform ${actionObject.actionTaken.props.name}_`
    }
};

//*******  These actionControllers require a target, so will return selectActionTarget game context  *******

const quickStrike = gameObjects => {
    console.log('Called selectActionMenu/quickStrike');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'slackCallback',
        'userActionValueSelection',
        'slackResponseTemplate'
    ]);

    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //If action is not available return action "unavailable" template
    if (!gameObjects.playerCharacter.isActionAvailable(gameObjects.actionTaken, gameObjects.currentMatch.props.number_turns)) {
        return {
            "text": `_${gameObjects.actionTaken.props.name} is still cooling down!_`
        }
    }

    return targetSelection(gameObjects);
};
const lifeTap = gameObjects => {
    console.log('Called selectActionMenu/lifeTap');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'slackCallback',
        'userActionValueSelection',
        'slackResponseTemplate',
        'currentMatch',
        'userActionValueSelection'
    ]);

    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //If action is not available return action "unavailable" template
    if (!gameObjects.playerCharacter.isActionAvailable(gameObjects.actionTaken, gameObjects.currentMatch.props.number_turns)) {
        return {
            "text": `_${gameObjects.actionTaken.props.name} is still cooling down!_`
        }
    }

    return targetSelection(gameObjects);
};
const arcaneBolt = gameObjects => {
    console.log('Called selectActionMenu/arcaneBolt');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'slackCallback',
        'userActionValueSelection',
        'slackResponseTemplate',
        'currentMatch',
        'userActionValueSelection'
    ]);

    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //If action is not available return action "unavailable" template
    if (!gameObjects.playerCharacter.isActionAvailable(gameObjects.actionTaken, gameObjects.currentMatch.props.number_turns)) {
        return {
            "text": `_${gameObjects.actionTaken.props.name} is still cooling down!_`
        }
    }

    return targetSelection(gameObjects);
};
const forkedLightning = gameObjects => {
    console.log('Called selectActionMenu/forkedLightning');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'slackCallback',
        'userActionValueSelection',
        'slackResponseTemplate',
        'currentMatch',
        'userActionValueSelection'
    ]);

    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //If action is not available return action "unavailable" template
    if (!gameObjects.playerCharacter.isActionAvailable(gameObjects.actionTaken, gameObjects.currentMatch.props.number_turns)) {
        return {
            "text": `_${gameObjects.actionTaken.props.name} is still cooling down!_`
        }
    }

    return targetSelection(gameObjects);
};
const savageStrike = gameObjects => {
    console.log('Called selectActionMenu/savageStrike');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'slackCallback',
        'userActionValueSelection',
        'slackResponseTemplate',
        'currentMatch',
        'userActionValueSelection'
    ]);

    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //If action is not available return action "unavailable" template
    if (!gameObjects.playerCharacter.isActionAvailable(gameObjects.actionTaken, gameObjects.currentMatch.props.number_turns)) {
        return {
            "text": `_${gameObjects.actionTaken.props.name} is still cooling down!_`
        }
    }

    return targetSelection(gameObjects);
};
const backstab = gameObjects => {
    console.log('Called selectActionMenu/backstab');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'slackCallback',
        'userActionValueSelection',
        'slackResponseTemplate',
        'currentMatch',
        'userActionValueSelection'
    ]);

    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //If action is not available return action "unavailable" template
    if (!gameObjects.playerCharacter.isActionAvailable(gameObjects.actionTaken, gameObjects.currentMatch.props.number_turns)) {
        return {
            "text": `_${gameObjects.actionTaken.props.name} is still cooling down!_`
        }
    }

    return targetSelection(gameObjects);
};
const poisonedBlade = gameObjects => {
    console.log('Called selectActionMenu/poisonedBlade');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'slackCallback',
        'userActionValueSelection',
        'slackResponseTemplate',
        'currentMatch',
        'userActionValueSelection'
    ]);

    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //If action is not available return action "unavailable" template
    if (!gameObjects.playerCharacter.isActionAvailable(gameObjects.actionTaken, gameObjects.currentMatch.props.number_turns)) {
        return {
            "text": `_${gameObjects.actionTaken.props.name} is still cooling down!_`
        }
    }

    return targetSelection(gameObjects);
};
const cleave = gameObjects => {
    console.log('Called selectActionMenu/cleave');

    validateGameObjects(gameObjects, [
        'game',
        'requestZone',
        'playerCharacter',
        'slackCallback',
        'userActionValueSelection',
        'slackResponseTemplate',
        'currentMatch',
        'userActionValueSelection'
    ]);

    gameObjects.actionTaken = new Action(gameObjects.game.state, gameObjects.userActionValueSelection);

    //If action is not available return action "unavailable" template
    if (!gameObjects.playerCharacter.isActionAvailable(gameObjects.actionTaken, gameObjects.currentMatch.props.number_turns)) {
        return {
            "text": `_${gameObjects.actionTaken.props.name} is still cooling down!_`
        }
    }

    return targetSelection(gameObjects);
};

module.exports = {
    shop,
    defensiveStance,
    offensiveStance,
    balancedStance,
    intoShadow,
    whirlwind,
    quickStrike,
    arcaneBolt,
    lifeTap,
    forkedLightning,
    savageStrike,
    backstab,
    poisonedBlade,
    cleave,
    firestorm
};
