"use strict";

var characterSelectionNew = require('./characterSelectionNew').characterSelectionNew;
var characterSelectionClass = require('./characterSelectionClass').characterSelectionClass;
var characterSelectionPicture = require('./characterSelectionPicture').characterSelectionPicture;

//Character index file used to manage the import of character related templates 

exports.characterSelectionIndex = {

    characterSelectionNew: characterSelectionNew,
    characterSelectionClass: characterSelectionClass,
    characterSelectionPicture: characterSelectionPicture
    
};