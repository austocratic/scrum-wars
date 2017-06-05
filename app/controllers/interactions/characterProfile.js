"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var characterProfile = require('../../slackTemplates/characterProfile').characterProfile;

var Character = require('../Character');

exports.characterProfile = payload => {

    return new Promise( (resolve, reject) => {

        //Get the template for character profile
        var template = characterProfile();

        //Create new firebase object
        var firebase = new Firebase();

        console.log('characterProfile payload: ', payload);
        
        //Get the slack user ID who made the selection
        //Slash commands have format payload.user_id
        //TODO Interactions should have a user ID argument passed in.  commands should pull the ID form payload differntly then interactiveMesages do
        var userID;

        if (payload.user_id) {
            userID = payload.user_id;
        } else {
            userID = payload.user.id;
        }

        //If characterProfile was called by interactive message than payload formatted differently:

        console.log('characterProfile userID: ', userID);

        var localCharacter = new Character();
        
        localCharacter.setByProperty('user_id', userID);

        console.log('Set the properties');
        
        console.log('Set character, character name: ', localCharacter.name);
        
        //Use Slack user ID to lookup the user's character
        firebase.get('character', 'user_id', userID)
            .then( character => {

                //Convert the returned object into array of character IDs.  This works since the query only returns one result
                var characterID = Object.keys(character)[0];

                var characterStats = character[characterID];

                //Array of stat keys
                var statKeys = Object.keys(characterStats);
                
                    template.attachments[0].image_url = "https://scrum-wars.herokuapp.com/assets/fullSize/" + characterStats.class_id + ".jpg";

                    //Iterate through the stat keys
                    template.attachments[1].fields = statKeys.map( key =>{

                        return {
                            "title": key,
                            "value": characterStats[key],
                            "short": true
                        };
                    });
                
                    //Interactive portion of profile menu
                    template.attachments[2] = {
                        
                        "callback_id": "profileOptionSelection",
                        "fallback": "Unable to load inventory buttons",
                        "actions": [{
                            "name": "inventory",
                            "text": "Inventory",
                            "style": "default",
                            "type": "button",
                            "value": "inventory"
                        },
                        {
                            "name": "equipment",
                            "text": "Equipped Items",
                            "style": "default",
                            "type": "button",
                            "value": "equipment"
                        }]
                    };

                    console.log('Final template: ', JSON.stringify(template));

                    resolve(template);

            });
    })
};