'use strict';

var Firebase = require('../libraries/firebase').Firebase;
var Slack = require('../libraries/slack').Alert;

var Zone = require('./Zone').Zone;

var firebase = new Firebase();


class Match {
    constructor() {}

    startCurrent(currentMatchID, startDate, zoneID){
        return new Promise((resolve, reject)=>{

            console.log('trying to startMatch, zone ID passed: ', zoneID);

            var localZone = new Zone();

            //Get the characters in zone
            localZone.getCharacterIDsIncludePlayer(zoneID)
                .then( charactersInZone =>{

                    console.log('Called getCharacters which returned: ', JSON.stringify(charactersInZone));

                    //Add a start date for the current match & charactersInZone array
                    var updates = {
                        "starting_character_ids": charactersInZone,
                        "date_started": startDate
                    };

                    //Update current matches properties
                    firebase.update(('match/' + currentMatchID), updates)
                        .then( () => {

                            console.log('Updated current match');

                            //Get details of zone
                            firebase.get('zone/' + zoneID)
                                .then(zoneDetails => {

                                    //Get all players (regardless of zone)
                                    firebase.get('character')
                                        .then(allCharacters => {

                                            console.log('allCharacters: ', JSON.stringify(allCharacters));

                                            var characterIDs = Object.keys(allCharacters);

                                            var turnActionUsedUpdate = {
                                                "turn_action_used": 0
                                            };

                                            //TODO pull out the reset character's actions functionality into a stand alone actions class
                                            //Iterate through characterID array resetting turn_action_used
                                            var characterUpdatePromises = characterIDs.map( characterID =>{

                                                return new Promise((resolve, reject)=>{
                                                    //Update that character
                                                    firebase.update(('character/' + characterID), turnActionUsedUpdate)
                                                        .then( () => {

                                                            //Next get that player's actions.  These need to be reset
                                                            var characterActions = allCharacters[characterID].actions;

                                                            console.log('characterActions: ', JSON.stringify(characterActions));

                                                            var singleActionUpdate = {
                                                                "turn_used": 0
                                                            };

                                                            var iterationIndex = 0;

                                                            console.log('About to iterate characters actions: ', characterID);

                                                            var characterActionUpdatePromises = characterActions.map( singleAction => {

                                                                console.log('Iterating characters actions, singleAction: ', singleAction);

                                                                //TODO for some reason this is not updating every action even though log shows it getting updated
                                                                //Maybe the way that array values are returned (end up in a different order, so certain actions are getting updated twice

                                                                return new Promise((resolve, reject)=>{
                                                                    firebase.update(('character/' + characterID + '/actions/' + iterationIndex), singleActionUpdate)
                                                                        .then( updateResponse => {
                                                                            console.log('Updated action: ', ('character/' + characterID + '/actions/' + iterationIndex));
                                                                            console.log('updatedResponse: ', updateResponse);
                                                                            iterationIndex++;
                                                                            resolve();
                                                                        });
                                                                })
                                                            });

                                                            Promise.all(characterActionUpdatePromises)
                                                                .then(()=>{
                                                                    resolve();
                                                                });
                                                        })
                                                })
                                            });

                                            //After all characters have been updated
                                            Promise.all(characterUpdatePromises)
                                                .then(()=>{
                                                    resolve();
                                                })
                                        });


                                    //Send a message to the channel announcing that the match has started
                                    var alertDetails = {
                                        "username": "A mysterious voice",
                                        "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                                        "channel": ("#" + zoneDetails.channel),
                                        "text": "The crowd roars as the match begins!"
                                    };

                                    //Create a new slack alert object
                                    var matchBeginsAlert = new Slack(alertDetails);

                                    //Send alert to slack
                                    matchBeginsAlert.sendToSlack(matchBeginsAlert.params)
                                        .then(() =>{
                                            console.log('Successfully posted to slack')
                                        })
                                        .catch(error =>{
                                            console.log('Error when sending to slack: ', error)
                                        });
                                });

                            //Resolve the promise regardless if it posted to slack
                            resolve();
                        });
                });
        })
    }

    isStarted(){
        console.log('called isStarted in Match.js');

        return new Promise((resolve, reject)=>{
            firebase.get('global_state/match_id')
                .then(matchID => {
                    //Get the details of that match
                    firebase.get('match/' + matchID)
                        .then(matchDetails => {

                            //The current match will not have a start date == 0 the match officially starts - it will have a date time stamp
                            var matchStart = matchDetails.date_started;

                            console.log('matchStart property from isMatchStarted(): ', matchStart);

                            //If match has not started, matchStart === 0
                            if (matchStart === 0){
                                resolve(false)
                            } else {
                                resolve(true)
                            }
                        });
                });
        })
    }
}


module.exports = {
    Match: Match
};