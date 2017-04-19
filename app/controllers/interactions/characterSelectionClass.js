"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var characterSelectionClass = require('../../slackTemplates/characterProfile').characterSelectionClass;


exports.characterSelectionClass = payload => {

    return new Promise( (resolve, reject) => {

        var template;
        
        //Determine if the user selected yes or no on previous screen
        if (payload.actions[0].value === "yes") {

            //Get the appropriate response template
            template = characterSelectionClass();

            var charProps = {
                name: 'Unknown Traveler',
                user_id: payload.user.id,
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

        } else if (payload.actions[0].value === "no") {

            //Need to close the dialogue


        } else {
            //Something went wrong, input option is not supported
        }

        //resolve(template);


    })
};