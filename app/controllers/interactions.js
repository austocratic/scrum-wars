"use strict";

var characterSelectionIndex = require('./../slackTemplates/characterSelectionIndex').characterSelectionIndex;
var characterProfile = require('./../slackTemplates/characterProfile').characterProfile;
var Firebase = require('../libraries/firebase').Firebase;


exports.interactions = (interactionType, messagePayloadInput) => {

    return new Promise((resolve, reject) => {

        var template;

        switch(interactionType){

            case 'characterProfile':

                //Get the template for character profile
                template = characterProfile();

                //Create new firebase object
                var firebase = new Firebase();

                //Get the slack user ID who made the selection
                var userID = messagePayloadInput.user_id;

                //Use Slack user ID to lookup the user's character
                firebase.get('character', 'user_id', userID)
                    .then( character => {

                        //Convert the returned object into array of character IDs.  This works since the query only returns one result
                        var characterID = Object.keys(character)[0];

                        var characterStats = character[characterID];

                        //Array of stat keys
                        var statKeys = Object.keys(characterStats);

                        //Array of profile field elements
                        var characterFields = template.attachments[1].fields;

                        //Iterate through the stat keys
                        var newArray = statKeys.map( key =>{

                            return {
                                "title": key,
                                "value": characterStats[key],
                                "short": true
                            };
                        });

                        template.attachments[1].fields = newArray;
                        
                        resolve(template);
                        
                    });
                
                break;
            
            case 'characterSelectionNew':

                template = characterSelectionIndex.characterSelectionNew();

                resolve(template);

                break;

            case 'characterSelectionClass':

                //Determine if the user selected yes or no on previous screen
                
                if (messagePayloadInput.actions[0].value === "yes") {

                    //Get the appropriate response template
                    template = characterSelectionIndex.characterSelectionClass();

                    var charProps = {
                        user_id: messagePayloadInput.user.id,
                        strength: 15,
                        stamina: 10
                    };

                    //Create new firebase object
                    var firebase = new Firebase();

                    //Add properties to DB
                    firebase.create('character', charProps)
                    //After writing to DB, resolve the template
                        .then( fbResponse => {
                            console.log('fbResponse: ', fbResponse);
                            resolve(template);
                        })
                        .catch( err => {
                            console.log('Error when writing to firebase: ', err);
                            reject(err);
                        });
                    
                } else if (messagePayloadInput.actions[0].value === "no") {

                    //Need to close the dialogue
                    
                    
                } else {
                    //Something went wrong, input option is not supported
                }
                
                //resolve(template);

                break;

            case 'characterSelectionPicture':

                template = characterSelectionIndex.characterSelectionPicture();

                //Create new firebase object
                var firebase = new Firebase();

                //Get the slack user ID who made the selection
                var userID = messagePayloadInput.user.id;

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
                            "class": messagePayloadInput.actions[0].value
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

                break;

            default:

                //return "ERROR: template not supported"
        }
    });
};