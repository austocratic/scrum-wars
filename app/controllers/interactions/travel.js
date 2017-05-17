"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var Slack = require('../../libraries/slack').Alert;

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

                var characterProperties = props[0][characterID];
                console.log('Character stats: ', characterProperties);

                var characterZone = props[1][zoneID];
                console.log('Zone details: ', characterZone);

                //Create a table reference to be used for locating the character
                var tableRef = 'character/' + characterID;

                //Define the properties to add to character
                var updates = {
                    "zone_id": zoneID
                };

                //Now update the character with new properties
                firebase.update(tableRef, updates)
                    .then( fbResponse => {
                        
                        //Send a message to the channel saying that a new traveler has entered the zone
                        var travelAlertDetails = {
                            "username": "A mysterious voice",
                            "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                            "channel": ("#" + characterZone.channel),
                            "text": (characterProperties.name + ' has entered ' + characterZone.name)
                        };

                        //Create a new slack alert object
                        var travelAlert = new Slack(travelAlertDetails);

                        //Send alert to slack
                        travelAlert.sendToSlack(this.params)
                            .then(() =>{
                                console.log('Successfully posted to slack')
                            })
                            .catch(error =>{
                                console.log('Error when sending to slack: ', error)
                            });

                        //Resolve regardless of sendToSlack result
                        resolve();
                    })
                    .catch( err => {
                        console.log('Error when /travel writing to firebase: ', err);
                        reject(err);
                    });
            });
    });
};