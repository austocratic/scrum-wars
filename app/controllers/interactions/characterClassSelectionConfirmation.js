"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var characterClassSelectionConfirmation = require('../../slackTemplates/characterClassSelectionConfirmation').characterClassSelectionConfirmation;


exports.characterClassSelectionConfirmation = payload => {

    return new Promise( (resolve, reject) => {

        var template = characterClassSelectionConfirmation();

        //Create new firebase object
        var firebase = new Firebase();

        //Get the slack user ID who made the selection
        var userID = payload.user.id;

        //TODO: need to check to see if class is already set and prevent it from being set

        //Use Slack user ID to lookup the associated character
        firebase.get('character', 'user_id', userID)
            .then( character => {

                console.log('character: ', character);

                //Convert the returned object into array of character IDs.  This works since the query only returns one result
                var characterID = Object.keys(character)[0];

                var classSelectionID = payload.actions[0].value;

                console.log('characterID: ', characterID);

                console.log('payload: ', payload);

                //Create a table reference to be used for locating the character
                var tableRef = 'character/' + characterID;

                //Lookup the character's starting properties
                firebase.get('class/' + classSelectionID)
                    .then( characterClass => {

                        console.log('characterClass: ', characterClass);

                        /*
                        //Convert the returned object into array of class IDs.  This works since the query only returns one result
                        var classID = Object.keys(characterClass)[0];

                        console.log('classID: ', classID);*/

                        var startingAttributes = characterClass.starting_attributes;

                        console.log('Starting attributes: ', startingAttributes);

                        //Define the properties to add to character
                        var updates = {
                            "class_id": classSelectionID,
                            "strength": startingAttributes.strength,
                            "toughness": startingAttributes.toughness,
                            "dexterity": startingAttributes.dexterity,
                            "intelligence": startingAttributes.intelligence
                        };

                        console.log('Updated stats: ', updates);

                        //Now update the character with new properties
                        firebase.update(tableRef, updates)
                            .then( fbResponse => {
                                console.log('interaction characterSelectionPicture fbResponse: ', fbResponse);
                                resolve(template);
                            })
                            .catch( err => {
                                console.log('Error when writing to firebase: ', err);
                                reject(err);
                            });
                    })
            });
    })
};