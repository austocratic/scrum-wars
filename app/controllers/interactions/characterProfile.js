"use strict";

var characterProfile = require('../../slackTemplates/characterProfile').characterProfile;

var Character = require('../Character').Character;

/*
exports.characterProfile = payload => {

    return new Promise( (resolve, reject) => {

        //Get the template for character profile
        var template = characterProfile();

        console.log('characterProfile payload: ', payload);
        
        //Get the slack user ID who made the selection
        //Slash commands have format payload.user_id
        //TODO Interactions should have a user ID argument passed in.  commands should pull the ID form payload differntly then interactiveMesages do
        var userID;

        //If characterProfile was called by interactive message than payload formatted differently:
        if (payload.user_id) {
            userID = payload.user_id;
        } else {
            userID = payload.user.id;
        }
        
        var localCharacter = new Character();
        
        localCharacter.setByProperty('user_id', userID)
            .then(()=>{

                //Array of stat keys
                var statKeys = Object.keys(localCharacter.props);

                template.attachments[0].image_url = "https://scrum-wars.herokuapp.com/assets/fullSize/" + localCharacter.props.class_id + ".jpg";

                //Iterate through the stat keys
                template.attachments[1].fields = statKeys.map( key =>{
                    return {
                        "title": key,
                        "value": localCharacter.props[key],
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
            .catch(err=>{
                console.log('error when calling setByProperty:', err);
            });
};*/


//TODO: testing async version - I may not be able to do it at this level

exports.characterProfile = async payload => {

    //Get the template for character profile
    var template = characterProfile();

    console.log('characterProfile payload: ', payload);

    //Get the slack user ID who made the selection
    //Slash commands have format payload.user_id
    //TODO Interactions should have a user ID argument passed in.  commands should pull the ID form payload differntly then interactiveMesages do
    var userID;

    //If characterProfile was called by interactive message than payload formatted differently:
    if (payload.user_id) {
        userID = payload.user_id;
    } else {
        userID = payload.user.id;
    }

    var localCharacter = new Character();

    await localCharacter.setByProperty('user_id', userID);

    //Array of stat keys
    var statKeys = Object.keys(localCharacter.props);

    template.attachments[0].image_url = "https://scrum-wars.herokuapp.com/assets/fullSize/" + localCharacter.props.class_id + ".jpg";

    //Iterate through the stat keys
    template.attachments[1].fields = statKeys.map( key =>{
        return {
            "title": key,
            "value": localCharacter.props[key],
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

    return(template);
    
};