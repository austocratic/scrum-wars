/*"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var Slack = require('../../libraries/slack').Alert;

var Character = require('../../models/Character').Character;
var Match = require('../../models/Match').Match;
var Zone = require('../..//models/Zone').Zone;

//var getCharacters = require('../../components/zone/getCharacters').getCharacters;

var firebase = new Firebase();

exports.resolveActions = (zoneID) => {
    
    return new Promise((resolve, reject) => {

        checkForDeath(zoneID)
            .then( deadCharacters =>{
                handleDeadCharacters(deadCharacters, zoneID)
                    .then(()=>{
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

                    //console.log('Dead characters in zone: ', JSON.stringify(charactersInZone));

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
                                        var localCharacter = new Character();
                                        
                                        localCharacter.setByID(singleDeadCharacterID)
                                            .then(()=>{
                                                localCharacter.moveZone("-Khu9Zazk5XdFX9fD2Y8", zoneDetails)
                                                    .then(()=>{
                                                        resolve();
                                                    });
                                            })
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

    function checkForMatchStartOrWin(matchID){

        console.log('called checkForMatchStartOrWin');

        return new Promise((resolve, reject)=>{

            //Lookup the global state to get next match start date/time
            firebase.get('global_state')
                .then(globalState => {

                var localMatch = new Match();

            //Check if the current match has started
            localMatch.isStarted()
                .then( isStarted =>{

                    var localZone = new Zone();

                        //Returns array of character IDs
                        localZone.getCharacterIDsIncludePlayer(zoneID)
                            .then( characterIDs =>{

                            if (isStarted) {
                            //console.log('resolveActions / checkForMatchStartOrWin livingCharacters: ', JSON.stringify(characterIDs));

                                localMatch.determineWinner(characterIDs, zoneID, matchID);

                            } else {

                                //console.log('Checking to see if next match should start.  Next match start: ', globalState.next_match_start);

                                var unixTime = (Date.now() / 1000);

                                //console.log('Current time stamp: ', unixTime);

                                //Compare the current time to the start time
                                if (unixTime >= globalState.next_match_start) {

                                    //Reset the match

                                    //console.log('Current time > next_match_start, start the match!');

                                    //Get all characters (regardless of zone)
                                    firebase.get('character')
                                        .then(allCharacters => {

                                            //console.log('allCharacters: ', JSON.stringify(allCharacters));

                                            var allCharacterIDs = Object.keys(allCharacters);

                                            //Iterate through those characters resetting their actions
                                            var characterUpdatePromises = allCharacterIDs.map(characterID => {

                                                //console.log('Iterating through characterIDs, characterID: ', characterID);

                                                return new Promise((resolve, reject)=>{
                                                    //Create a local character, set it's properties then reset its actions
                                                    var localCharacter = new Character();
                                                    localCharacter.setByID(characterID)
                                                        .then(()=> {
                                                            //Now that localCharacters properties are set, reset the actions
                                                            localCharacter.resetActions()
                                                                .then(()=> {
                                                                    resolve();
                                                                })
                                                        })
                                                });
                                            });

                                            Promise.all(characterUpdatePromises)
                                                .then(()=> {
                                                    console.log('Successfully updated characters actions!');

                                                    //After character actions are updated, start the match
                                                    localMatch.startCurrent(globalState.match_id, unixTime, zoneID, characterIDs)
                                                        .then(()=> {
                                                            console.log('Successfully started new match!');

                                                            resolve();
                                                        })
                                                })
                                        })

                                } else {
                                    resolve();
                                }
                            }
                    })

                });
            });
        });
    }
};
*/