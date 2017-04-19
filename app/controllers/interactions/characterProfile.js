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

                //Array of profile field elements
                //var characterFields = template.attachments[1].fields;

                //Iterate through the stat keys
                template.attachments[1].fields = statKeys.map( key =>{

                    return {
                        "title": key,
                        "value": characterStats[key],
                        "short": true
                    };
                });

                resolve(template);

            });
    })
};