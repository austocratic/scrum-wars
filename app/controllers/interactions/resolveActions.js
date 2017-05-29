"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var Slack = require('../../libraries/slack').Alert;

var getCharacters = require('../../components/zone/getCharacters').getCharacters;


exports.resolveActions = (zoneID) => {
    
    var firebase = new Firebase();
    
    return new Promise((resolve, reject) => {

        checkForDeath(zoneID)
            .then( deadCharacters =>{
                handleDeadCharacters(deadCharacters, zoneID)
                    .then(()=>{
                        console.log('resolved checkForDeath & handleDeadCharacters');

                        //Determine current match ID
                        firebase.get('global_state/match_id')
                            .then(currentMatch => {

                                checkForMatchStartOrWin(currentMatch)
                                    .then(()=>{
                                        resolve();
                                    })

                            });
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

            if (deadCharacters.length > 0){

                var deadCharactersPromises = deadCharacters.map( singleDeadCharacterID =>{

                    //Get the details of the zone
                    return new Promise((resolve, reject)=>{
                        firebase.get('zone/' + zoneID)
                            .then(zoneDetails => {

                                //Get the details of the dead character
                                firebase.get('character/' + singleDeadCharacterID)
                                    .then(characterDetails => {

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

                                        //TODO hard coded the town ID
                                        moveCharacter(singleDeadCharacterID, characterDetails, "-Khu9Zazk5XdFX9fD2Y8", zoneDetails)
                                            .then(()=>{
                                                resolve();
                                            });
                                    });
                            });
                    })
                });

                Promise.all(deadCharactersPromises)
                    .then(()=>{
                        resolve();
                })

            } else {
                //No dead characters, resolve
                resolve()
            }
        });
    }

    function moveCharacter(characterID, characterDetails, destinationID, zoneDetails){

        return new Promise((resolve, reject) => {

            //Create a table reference to be used for locating the character
            var tableRef = 'character/' + characterID;

            //Define the properties to add to character
            var updates = {
                "zone_id": destinationID
            };

            //Now update the character with new properties
            firebase.update(tableRef, updates)
                .then( () => {
                    resolve();
                });

            //Send slack alert that player was defeated
            var alertDetails = {
                "username": "A mysterious voice",
                "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                "channel": ("#" + zoneDetails.channel),
                "text": characterDetails.name + " has left " + zoneDetails.name
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
    }

    function isMatchStarted(){
        return new Promise((resolve, reject)=>{
            firebase.get('global_state/match_id')
                .then(matchID => {
                    //Get the details of that match
                    firebase.get('match/' + matchID)
                        .then(matchDetails => {

                            //The current match will not have a start date == 0 the match officially starts - it will have a date time stamp
                            var matchStart = matchDetails.date_started;

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

    function startMatch(currentMatchID, startDate){

        return new Promise((resolve, reject)=>{

            console.log('trying to startMatch, zone ID passed: ', zoneID);

            getCharacters.getIDsIncludePlayerCharacter(zoneID)
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

                            //Get details of zone
                            firebase.get('zone/' + zoneID)
                                .then(zoneDetails => {

                                    //Send a message to the channel announcing that the match has started
                                    var travelAlertDetails = {
                                        "username": "A mysterious voice",
                                        "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                                        "channel": ("#" + zoneDetails.channel),
                                        "text": "The crowd roars as the match begins!"
                                    };

                                    //Create a new slack alert object
                                    var travelAlert = new Slack(travelAlertDetails);

                                    //Send alert to slack
                                    travelAlert.sendToSlack(travelAlert.params)
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

    function checkForMatchStartOrWin(matchID){

        return new Promise((resolve, reject)=>{

            //Ensure that the current match has started
            isMatchStarted()
                .then( isStarted =>{

                    console.log('isMatchStarted? ', isStarted);

                    if (isStarted) {

                        //See what characters are currently in the zone.
                        getCharacters.getIDsIncludePlayerCharacter(zoneID)
                            .then( livingCharacters =>{

                                console.log('resolveActions / checkForMatchStartOrWin livingCharacters: ', JSON.stringify(livingCharacters));

                                //If there is only one character left, match is won by that character!
                                if (livingCharacters.length === 1){

                                    var matchWinnerID = livingCharacters[0];

                                    //Update match winner to that character
                                    var tableRef = 'match/' + matchID;

                                    //Define the properties to add to character
                                    var updates = {
                                        "character_id_won": matchWinnerID,
                                        "date_ended": Date.now()
                                    };

                                    //Now update the character with new properties
                                    firebase.update(tableRef, updates)
                                        .then( () => {
                                            resolve();
                                        });

                                    var newMatchDetails = {

                                        "character_id_won": 0,
                                        "date_ended": 0,
                                        "date_started": 0,
                                        "number_turns": 0,
                                        "starting_character_ids": 0,
                                        "zone_id": 0
                                    };

                                    //Create a new match
                                    firebase.create('match', newMatchDetails)
                                        .then( newMatchID =>{

                                            //TODO: need to dynamically generate the next match start
                                            var nextMatchStart = 1496098800;

                                            //Update the global state to the new match ID
                                            var matchUpdates = {
                                                "match_id": newMatchID,
                                                "next_match_start": nextMatchStart
                                            };

                                            //Now update the character with new properties
                                            firebase.update('global_state', matchUpdates)
                                                .then( () => {
                                                    resolve();
                                                });
                                        });

                                    //Get details of the zone
                                    firebase.get('zone/' + zoneID)
                                        .then(zoneDetails => {

                                            //Get details of the winning character
                                            firebase.get('character/' + matchWinnerID)
                                                .then(matchWinnerDetails => {

                                                    //Send slack alert abut the winner
                                                    var alertDetails = {
                                                        "username": "A mysterious voice",
                                                        "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                                                        "channel": ("#" + zoneDetails.channel),
                                                        "text": "*The crowd erupts in celebration.  A winner stands victorious!*" +
                                                        "\n Congratulations " + matchWinnerDetails.name,
                                                        "attachments": [
                                                            {
                                                                "fallback": "Required plain-text summary of the attachment.",
                                                                "image_url": "http://dspncdn.com/a1/media/692x/cf/99/07/cf9907357589bf6e8af88ca3c1d7469c.jpg"
                                                            }
                                                        ]
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
                                } else {
                                    //More characters are alive than 1, resolve
                                    resolve()
                                }
                            });

                    } else {
                        console.log('Hit else statement, current match has not started');

                        //Lookup the global state to get next match start date/time
                        firebase.get('global_state')
                            .then(currentMatch => {

                                console.log('Checking to see if next match should start.  Next match start: ', currentMatch.next_match_start);

                                //TODO left off here, date.now is a different format than stored in the DB

                                var unixTime = (Date.now() / 1000);

                                console.log('Current time stamp: ', unixTime);

                                //Compare the current time to the start time
                                if (unixTime >= currentMatch.next_match_start) {

                                    console.log('Current time > next_match_start, start the match!');
                                    //Start the match!
                                    startMatch(currentMatch.match_id, unixTime)
                                        .then(()=>{
                                            resolve();
                                        })
                                } else {
                                    resolve();
                                }
                            });
                    }
                });
        });
    }
};
