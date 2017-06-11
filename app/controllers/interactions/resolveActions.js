"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var Slack = require('../../libraries/slack').Alert;

var Character = require('../Character').Character;
var Match = require('../Match').Match;
var Zone = require('../Zone').Zone;

var getCharacters = require('../../components/zone/getCharacters').getCharacters;


exports.resolveActions = (zoneID) => {
    
    //var testCharacter = new Character;

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

    function checkForMatchStartOrWin(matchID){

        console.log('called checkForMatchStartOrWin');

        return new Promise((resolve, reject)=>{

            var localMatch = new Match();
            
            //Check if the current match has started
            localMatch.isStarted()
                .then( isStarted =>{
                    console.log('isMatchStarted? ', isStarted);

                    var localZone = new Zone();

                        if (isStarted) {

                            //Returns array of character IDs
                            localZone.getCharacterIDsIncludePlayer(zoneID)
                                .then( characterIDs =>{


                            console.log('resolveActions / checkForMatchStartOrWin livingCharacters: ', JSON.stringify(characterIDs));

                            //If there is only one character left, match is won by that character!
                            if (characterIDs.length === 1){

                                var matchWinnerID = characterIDs[0];

                                //Get details of the winning character
                                firebase.get('character/' + matchWinnerID)
                                    .then(characterDetails => {

                                        var matchWins = characterDetails.match_wins;

                                        matchWins++;

                                        //Define the properties to add to character
                                        var characterUpdates = {
                                            "match_wins": matchWins
                                        };

                                        //Now update the character with new properties
                                        firebase.update('character/' + matchWinnerID, characterUpdates)
                                    });

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
                                    .then( newMatch =>{

                                        console.log('newMatchID: ', newMatch);

                                        //TODO: need to dynamically generate the next match start
                                        var nextMatchStart = 1496098800;

                                        //Update the global state to the new match ID
                                        var matchUpdates = {
                                            "match_id": newMatch.name,
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
                            })

                        } else {
                            console.log('Hit else statement, current match has not started');

                            //Lookup the global state to get next match start date/time
                            firebase.get('global_state')
                                .then(currentMatch => {

                                    console.log('Checking to see if next match should start.  Next match start: ', currentMatch.next_match_start);

                                    var unixTime = (Date.now() / 1000);

                                    console.log('Current time stamp: ', unixTime);

                                    //Compare the current time to the start time
                                    if (unixTime >= currentMatch.next_match_start) {

                                        console.log('Current time > next_match_start, start the match!');
                                        //Start the match!
                                        var localMatch = new Match();

                                        //Get all characters (regardless of zone)
                                        firebase.get('character')
                                            .then(allCharacters => {

                                                console.log('allCharacters: ', JSON.stringify(allCharacters));

                                                var allCharacterIDs = Object.keys(allCharacters);

                                                //Iterate through those characters resetting their actions
                                                var characterUpdatePromises = allCharacterIDs.map(characterID => {

                                                    console.log('Iterating through characterIDs, characterID: ', characterID);

                                                    //Create a local character, set it's properties then reset its actions
                                                    var localCharacter = new Character(characterID);
                                                    localCharacter.setByID()
                                                        .then(()=> {
                                                            //Now that localCharacters properties are set, reset the actions
                                                            localCharacter.resetActions()
                                                                .then(()=> {
                                                                    resolve();
                                                                })
                                                        })
                                                });

                                                Promise.all(characterUpdatePromises)
                                                    .then(()=> {
                                                        console.log('Successfully updated characters actions!');

                                                        //After character actions are updated, start the match
                                                        localMatch.startCurrent(currentMatch.match_id, unixTime, zoneID, characterIDs)
                                                            .then(()=> {
                                                                console.log('Successfully started new match!');

                                                                resolve();
                                                            })
                                                    })
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
