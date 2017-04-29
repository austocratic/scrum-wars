"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var characterSelectionPicture = require('../../slackTemplates/characterSelectionPicture').characterSelectionPicture;


exports.characterSelectionPicture = payload => {

    return new Promise( (resolve, reject) => {

        var template = characterSelectionPicture();

        //Create new firebase object
        var firebase = new Firebase();

        //Get the slack user ID who made the selection
        var userID = payload.user.id;

        //TODO: need to check to see if class is already set and prevent it from being set

        //Use Slack user ID to lookup the associated character
        firebase.get('character', 'user_id', userID)
            .then( character => {

                //Convert the returned object into array of character IDs.  This works since the query only returns one result
                var characterID = Object.keys(character)[0];

                //Create a table reference to be used for locating the character
                var tableRef = 'character/' + characterID;

                //Define the properties to add to character
                var updates = {
                    "class": payload.actions[0].value
                };

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
            });
    })
};