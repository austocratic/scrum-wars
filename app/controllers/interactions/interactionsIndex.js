"use strict";

var characterProfile = require('./characterProfile').characterProfile;
var characterSelectionNew = require('./characterSelectionNew').characterSelectionNew;
var characterSelectionClass = require('./characterSelectionClass').characterSelectionClass;
var characterSelectionPicture = require('./characterSelectionPicture').characterSelectionPicture;
var nameCharacter = require('./nameCharacter').nameCharacter;
var playerAction = require('./playerAction').playerAction;
var playerAttack = require('./playerAttack').playerAttack;
var playerActionSelection = require('./playerActionSelection').playerActionSelection;
var travel = require('./travel').travel;

//Character index file used to manage the import of character related templates 

exports.interactionsIndex = {
    characterProfile: characterProfile,
    characterSelectionNew: characterSelectionNew,
    characterSelectionClass: characterSelectionClass,
    characterSelectionPicture: characterSelectionPicture,
    nameCharacter: nameCharacter,
    playerAction: playerAction,
    playerAttack: playerAttack,
    playerActionSelection: playerActionSelection,
    travel: travel
};