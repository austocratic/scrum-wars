"use strict";

var characterSelectionNew = require('./characterSelectionNew').characterSelectionNew;
var characterSelectionClass = require('./characterSelectionClass').characterSelectionClass;
var characterClassSelectionConfirmation = require('./characterClassSelectionConfirmation').characterClassSelectionConfirmation;

//Character index file used to manage the import of character related templates 

exports.characterSelectionIndex = {

    characterSelectionNew: characterSelectionNew,
    characterSelectionClass: characterSelectionClass,
    characterClassSelectionConfirmation: characterClassSelectionConfirmation
    
};