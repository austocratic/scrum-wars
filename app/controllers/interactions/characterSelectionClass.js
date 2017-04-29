"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var characterSelectionClass = require('../../slackTemplates/characterSelectionClass').characterSelectionClass;


exports.characterSelectionClass = payload => {

    console.log('called: characterSelectionClass');

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
                    var characterKeys = Object.keys(character);

                    //If player has a character, delete it
                    if (characterKeys.length > 0) {

                        var characterID = characterKeys[0];

                        //Delete that user's character
                        firebase.delete(('character/' + characterID))
                            .then(deleteResults => {
                                console.log('deleteResults: ', deleteResults);
                            });
                    }

                    //Get the appropriate response template
                    template = characterSelectionClass();

                    var charProps = {
                        name: 'Unknown Traveler',
                        profile_image: 'unknown_character.jpg',
                        user_id: payload.user.id,
                        armor: 0,
                        hit_points: 100
                    };

                    //Get all the available classes from the DB
                    firebase.get('class')
                        .then( characterClasses => {

                            //Get an array of all class IDs
                            var classIDs = Object.keys(characterClasses);
                            
                            var classNames = classIDs.map( classID =>{
                                return characterClasses[classID].name;
                            });

                            var actionsBaseTemplate = {
                                "name": 'classOptions',
                                "text": '',
                                "type": 'select',
                                "options": []
                            };

                            var optionsTemplate = classNames.map( className =>{

                                return {
                                    "text": className,
                                    "value": className
                                }
                            });

                            actionsBaseTemplate.options = optionsTemplate;

                            template.attachments[0].actions[0] = actionsBaseTemplate;

                            console.log('Final template: ', JSON.stringify(template));
                            
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
                        });
                    })
                    .catch( err =>{
                        console.log('Error when getting player character: ', err)
                    })

            
        } else if (payload.actions[0].value === "no") {

            //Need to load a confirmation message here


        } else {
            //Something went wrong, input option is not supported
            console.log('Hit else condition')
        }

        //resolve(template);

    })
};