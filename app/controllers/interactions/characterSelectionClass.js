"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var characterSelectionClass = require('../../slackTemplates/characterSelectionClass').characterSelectionClass;


exports.characterSelectionClass = payload => {

    return new Promise( (resolve, reject) => {

        var template;
        
        //Determine if the user selected yes or no on previous screen
        if (payload.actions[0].value === "yes") {

            //Create new firebase object
            var firebase = new Firebase();

            //Get the slack user ID who called the action
            var userID = payload.user.id;

            //Get that user's character
            firebase.get('character', 'user_id', userID)
                .then( character => {

                    //Character's ID
                    var characterID = Object.keys(character)[0];
                    
                    //Delete that user's character
                    firebase.delete(('character/' + characterID))
                        .then( deleteResults => {

                            //Get the appropriate response template
                            template = characterSelectionClass();

                            var charProps = {
                                name: 'Unknown Traveler',
                                user_id: payload.user.id,
                                strength: 15,
                                stamina: 10
                            };

                            //Add properties to DB
                            firebase.create('character', charProps)
                            //After writing to DB, resolve the template
                                .then(fbResponse => {
                                    console.log('fbResponse: ', fbResponse);
                                    resolve(template);
                                })
                                .catch(err => {
                                    console.log('Error when writing to firebase: ', err);
                                    reject(err);
                                });

                        })
                        .catch( err =>{

                        })
                    
                });
            
        } else if (payload.actions[0].value === "no") {

            //Need to load a confirmation message here


        } else {
            //Something went wrong, input option is not supported
            console.log('Hit else condition')
        }

        //resolve(template);

    })
};