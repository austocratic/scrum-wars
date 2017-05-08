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
                
                    //TODO maybe move fields/image into one attachment
                
                    template.attachments[0].image_url = "https://scrum-wars.herokuapp.com/assets/fullSize/" + characterStats.class_id + ".jpg";

                    //Iterate through the stat keys
                    template.attachments[0].fields = statKeys.map( key =>{

                        return {
                            "title": key,
                            "value": characterStats[key],
                            "short": true
                        };
                    });
                
                    //Interactive portion of profile menu
                    template.attachments[1] = {
                        
                        "actions": [{
                            "name": "inventory",
                            "text": "Inventory",
                            "style": "default",
                            "type": "button",
                            "value": "inventory" //TODO make this interactive
                        }]
                    };

                    console.log('Final template: ', JSON.stringify(template));

                    resolve(template);

            });
    })
};