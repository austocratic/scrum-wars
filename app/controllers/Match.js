'use strict';

var Firebase = require('../libraries/firebase').Firebase;

var firebase = new Firebase();


class Match {
    constructor() {}


    start(){

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