'use strict';

//var Firebase = require('../libraries/firebase').Firebase;
//var Slack = require('../libraries/slack').Alert;
//var FirebaseBaseController = require('./FirebaseBaseController').FirebaseBaseController;

//var Zone = require('./Zone').Zone;

//var firebase = new Firebase();


var _ = require('lodash');
var BaseModel = require('./BaseModel').BaseModel;


class Match extends BaseModel{
    constructor(gameState, matchID){
        super(gameState, 'match', matchID);

        var matches = gameState.match;

        //Set the character's props
        this.props = matches[matchID];
        this.id = matchID

    }
    
    //Start the match
    start(){
        this.updateProperty('status', 'started')
    }

    end(){
        this.updateProperty('status', 'ended')
    }

    getStartingCharacterIDs(){
        if (this.props.starting_character_ids) {
            return this.props.starting_character_ids
        }
        
        return [];
    }
}








/*
class Match extends FirebaseBaseController{
    constructor() {
        super();
        this.firebaseType = 'match'
    }

    startCurrent(currentMatchID, startDate, zoneID, charactersInZone){
        return new Promise((resolve, reject)=>{

            console.log('trying to startMatch, zone ID passed: ', zoneID);

            //var localZone = new Zone();

            console.log('Called getCharacters which returned: ', JSON.stringify(charactersInZone));

            //Add a start date for the current match & charactersInZone array
            var updates = {
                "starting_character_ids": charactersInZone,
                "date_started": startDate
            };

            firebase.get('zone/' + zoneID)
                .then(zoneDetails => {
                    
                    //Update current matches properties
                    firebase.update(('match/' + currentMatchID), updates)
                        .then(() => {

                            console.log('Updated current match');

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
                                .then(() => {
                                    console.log('Successfully posted to slack')
                                })
                                .catch(error => {
                                    console.log('Error when sending to slack: ', error)
                                });
                        });

                    //Resolve the promise regardless if it posted to slack
                    resolve();
                });
            });
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

    determineWinner(characterIDs, zoneID, matchID){
        
        return new Promise((resolve, reject)=>{
            
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
                "number_turns": 1,
                "starting_character_ids": 0,
                "zone_id": 0
            };

            //Create a new match
            firebase.create('match', newMatchDetails)
                .then( newMatch =>{

                    //Get current date
                    var todayDate = new Date();

                    //"Round" the date to remove time
                    todayDate.setHours(0);
                    todayDate.setMinutes(0);
                    todayDate.setSeconds(0);

                    //Create unix timestamp
                    var now = (todayDate.getTime() / 1000);

                    //Increment today's date to tomorrow
                    var tomorrow = now + (24 * 60 * 60);

                    //Increment tomorrow to include time
                    //TODO: start time is hardcoded here need to add to config
                    //var nextMatchStart = tomorrow + (11 * 60 * 60);

                    //TODO: for testing, hard coded start date that has passed, replace with above
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
    }
}*/


module.exports = {
    Match: Match
};