"use strict";

var Firebase = require('../../../libraries/firebase').Firebase;
var travel = require('../zone/travel').travel;


exports.travelDialogueSelection = payload => {

    var firebase = new Firebase();

    var responseTemplate;

    return new Promise((resolve, reject)=> {

        //If "no" dont move the player's character and return a blank resolution
        if (payload.actions[0].value === "no"){
            resolve()
        }

        //Get the slack user ID who made the selection
        var userID = payload.user.id;
        var channelID = payload.channel.id;
        
        //If not "no" call the travel action
        //Travel expects payload to contain user_id & channel_id
        travel(userID, channelID)
            .then(()=>{
                resolve();
            })

    })

};