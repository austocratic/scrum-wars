"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var characterNameTaken = require('../../slackTemplates/characterNameTaken').characterNameTaken;
var characterNameAccepted = require('../../slackTemplates/characterNameAccepted').characterNameAccepted;


exports.nameCharacter = payload => {
    
    return new Promise( (resolve, reject) => {
        
        //Get the text input of the command
        var characterName = payload.text;

        //Create new firebase object
        var firebase = new Firebase();

        var template;
        
        //First check to ensure the character name is not in use
        firebase.get('character', 'name', characterName)
            .then( character => {

                //Array of character IDs already using that name
                var existingCharacter = Object.keys(character);

                //If array of existing character's length > 0, name is already taken, return "name taken" template
                if (existingCharacter.length > 0){
                    //var template = characterNameTaken();

                    resolve(characterNameTaken());
                }


                template = characterNameAccepted();

                //Concatenate character name into template
                template.attachments[0].text = (template.attachments[0].text + characterName);
                
                //If not, resolve the confirmation template
                resolve(template);
            });
        
        //Get the slack user ID who made the selection
        var userID = payload.user_id;

        //Use Slack user ID to lookup the user's character
        firebase.get('character', 'user_id', userID)
            .then( character => {

                var characterID = Object.keys(character)[0];

                //Create a table reference to be used for locating the character
                var tableRef = 'character/' + characterID;

                //Define the properties to add to character
                var updates = {
                    "name": characterName
                };

                //Now update the character with new properties
                firebase.update(tableRef, updates)
                    .then( fbResponse => {
                        console.log('interaction /name fbResponse: ', fbResponse);
                        resolve();
                    })
                    .catch( err => {
                        console.log('Error when /name writing to firebase: ', err);
                        reject(err);
                    });
            });
        
        
    })
};