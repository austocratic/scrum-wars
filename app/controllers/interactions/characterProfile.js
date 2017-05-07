"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var characterProfile = require('../../slackTemplates/characterProfile').characterProfile;

exports.characterProfile = payload => {

    return new Promise( (resolve, reject) => {

        //Get the template for character profile
        var template = characterProfile();

        //Create new firebase object
        var firebase = new Firebase();

        //Get the slack user ID who made the selection
        var userID = payload.user_id;

        //Use Slack user ID to lookup the user's character
        firebase.get('character', 'user_id', userID)
            .then( character => {

                //Convert the returned object into array of character IDs.  This works since the query only returns one result
                var characterID = Object.keys(character)[0];

                var characterStats = character[characterID];

                //Array of stat keys
                var statKeys = Object.keys(characterStats);

                console.log('Char name: ', characterStats.name);

                //Set Message properties:
                //template.username = (characterStats.name + "s Profile");
                template.username = "TEST";

                console.log('username: ', template.username);

                //Get properties of the player's class
                //firebase.get('class/' + character.class_id)
                //    .then( characterClass => {

                        //var classID = Object.keys(characterClass)[0];

                        //If the player has a profile picture: get & set profile image
                        template.attachments[0].image_url = "https://scrum-wars.herokuapp.com/assets/fullSize/" + character.class_id + ".jpg";

                        //Iterate through the stat keys
                        template.attachments[1].fields = statKeys.map( key =>{

                            return {
                                "title": key,
                                "value": characterStats[key],
                                "short": true
                            };
                        });

                        console.log('Final template: ', JSON.stringify(template));

                        resolve(template);

                    //});

            });
    })
};