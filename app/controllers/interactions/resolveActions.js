"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var Slack = require('../../libraries/slack').Alert;
var travel = require('./travel').travel;


exports.resolveActions = (zoneID, channelID, userID) => {

    console.log('Called resolveActions');
    console.log('zoneID: ', zoneID);
    console.log('channelID: ', channelID);
    console.log('userID: ', userID);
    
    var firebase = new Firebase();
    
    return new Promise((resolve, reject) => {

        checkForDeath(zoneID)
            .then( deadCharacters =>{
                handleDeadCharacters(deadCharacters, zoneID)
                    .then(()=>{
                        console.log('resolved checkForDeath & handleDeadCharacters')
                    })
            });
    });
    
        //Post action clean up (check for player defeated, ect)
        //TODO in the future I should refactor this to refresh certain zones based on certain actions
        function checkForDeath(zoneID){

            return new Promise((resolve, reject) => {

                //Get all the characters
                firebase.get('character')
                    .then(allCharacters => {

                        //Get an array of all character IDs in the zone
                        var characterIDArray = Object.keys(allCharacters);

                        var singleCharacter;

                        //Filter list: return array of character IDs in the zone, that are dead
                        var charactersInZone = characterIDArray.filter(singleCharacterID=> {

                            singleCharacter = allCharacters[singleCharacterID];
                            return singleCharacter.zone_id === zoneID && singleCharacter.hit_points <= 0
                        });

                        console.log('Dead characters in zone: ', JSON.stringify(charactersInZone));

                        resolve(charactersInZone);

                    });
            });
        };


        //Parameter passed should be an array of character IDs that are "dead"
        //This function will notify the zone of the deaths, move the characters to the town, and set the defeated property in the DB
        function handleDeadCharacters(deadCharacters, zoneID){

            return new Promise((resolve, reject) => {

                deadCharacters.forEach( singleDeadCharacterID =>{

                    //Get the details of the zone
                    firebase.get('zone/' + zoneID)
                        .then(zoneDetails => {

                            //Get the details of the dead character
                            firebase.get('character/' + singleDeadCharacterID)
                                .then(characterDetails => {

                                    //Update the character's zone by emitting a travel action
                                    var payload = {
                                        user_id: userID,
                                        channel_id: channelID
                                    };
                                    
                                    travel(payload);
                                    
                                    //Send slack alert that player was defeated
                                    var alertDetails = {
                                        "username": "A mysterious voice",
                                        "icon_url": "https://s-media-cache-ak0.pinimg.com/736x/d8/59/10/d859102236d09cf470a41e4b6974b79a.jpg",
                                        "channel": ("#" + zoneDetails.channel),
                                        "text": characterDetails.name + " has been defeated!"
                                    };

                                    //Create a new slack alert object
                                    var channelAlert = new Slack(alertDetails);

                                    //Send alert to slack
                                    channelAlert.sendToSlack(channelAlert.params)
                                        .then(() =>{
                                            console.log('Successfully posted to slack')
                                        })
                                        .catch(error =>{
                                            console.log('Error when sending to slack: ', error)
                                        });
                                });
                        });
                });
            });
        }





};