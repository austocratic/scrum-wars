"use strict";

var Firebase = require('../../libraries/firebase').Firebase;


exports.travel = payload => {

    return new Promise((resolve, reject) =>{

        //TODO: need to add a template: something announcing to the zone that character 'XXX' has entered the zone

        //Create new firebase object
        var firebase = new Firebase();

        //Get the slack user ID who made the selection
        var userID = payload.user_id;
        var channelID = payload.channel_id;

        //Use Slack user ID to lookup the user's character
        var get1 = firebase.get('character', 'user_id', userID);

        //Use Slack channel ID to lookup the zone id
        var get2 = firebase.get('zone', 'channel_id', channelID);

        //Wait for both above promises to resolve
        Promise.all([get1, get2])
            .then( props =>{

                var characterID = Object.keys(props[0])[0];
                var zoneID = Object.keys(props[1])[0];

                //Create a table reference to be used for locating the character
                var tableRef = 'character/' + characterID;

                //Define the properties to add to character
                var updates = {
                    "zone_id": zoneID
                };

                //Now update the character with new properties
                firebase.update(tableRef, updates)
                    .then( fbResponse => {
                        console.log('interaction /travel fbResponse: ', fbResponse);
                        resolve();
                    })
                    .catch( err => {
                        console.log('Error when /travel writing to firebase: ', err);
                        reject(err);
                    });
            });
    });
};