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

                    //TODO currently hardcoding starting values. Should have a default table set these
                    var charProps = {
                        name: 'Unknown Traveler',
                        profile_image: 'unknown_character.jpg',
                        user_id: payload.user.id,
                        gold: 100,
                        armor: 0,
                        hit_points: 100,
                        max_hit_points: 100,
                        match_wins: 0,
                        zone_id: '-Khu9Zazk5XdFX9fD2Y8',
                        inventory: {
                            equipped: {
                                hand_1: "-Kjk3sGUJy5Nu8GWsdff"
                            },
                            unequipped: [
                                "-Kjk3sGUJy5Nu8GWsdff"
                            ]
                        },
                        is_defending: false
                    };

                    //Get all the available classes from the DB
                    firebase.get('class')
                        .then( characterClasses => {

                            //Get an array of all class IDs
                            var classIDs = Object.keys(characterClasses);
                            
                            var classNames = classIDs.map( classID =>{
                                return characterClasses[classID].name;
                            });

                            //template.attachments = classNames.map( className =>{
                            template.attachments = classIDs.map( singleClassID =>{

                                //Get the name for the class ID
                                var className = characterClasses[singleClassID].name;
                                
                                return {

                                    "title": className,
                                    "fallback": "You are unable to choose an action",
                                    "callback_id": "characterSelectionClass",
                                    "color": "#3AA3E3",
                                    "attachment_type": "default",
                                    "image_url": "https://scrum-wars.herokuapp.com/assets/fullSize/" + singleClassID + ".jpg",
                                    "actions": [{
                                        "name": className,
                                        "text": className,
                                        "style": "default",
                                        "type": "button",
                                        "value": singleClassID
                                    }]
                                }
                            });

                            //actionsBaseTemplate.options = optionsTemplate;

                            //template.attachments = attachmentTemplate;

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

            template = {
                "text": "You decide to continue your journey with your current character"
            };

            resolve(template);

        } else {
            //Something went wrong, input option is not supported
            console.log('Hit else condition')
        }

        //resolve(template);

    })
};