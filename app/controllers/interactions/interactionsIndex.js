"use strict";

var characterProfile = require('./characterProfile').characterProfile;
var characterSelectionNew = require('./characterSelectionNew').characterSelectionNew;
var characterSelectionClass = require('./characterSelectionClass').characterSelectionClass;
var characterClassSelectionConfirmation = require('./characterClassSelectionConfirmation').characterClassSelectionConfirmation;
var nameCharacter = require('./nameCharacter').nameCharacter;
var playerAction = require('./playerAction').playerAction;
var playerAttack = require('./playerAttack').playerAttack;
var playerActionSelection = require('./playerActionSelection').playerActionSelection;
var shopItemSelection = require('./shopItemSelection').shopItemSelection;
var travel = require('./travel').travel;

//Character index file used to manage the import of character related templates 

exports.interactionsIndex = {
    characterProfile: characterProfile,
    characterSelectionNew: characterSelectionNew,
    characterSelectionClass: characterSelectionClass,
    characterClassSelectionConfirmation: characterClassSelectionConfirmation,
    nameCharacter: nameCharacter,
    playerAction: playerAction,
    playerAttack: playerAttack,
    playerActionSelection: playerActionSelection,
    shopItemSelection: shopItemSelection,
    travel: travel
};