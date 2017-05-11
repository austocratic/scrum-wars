"use strict";

var Firebase = require('../libraries/firebase').Firebase;
var Slack = require('../libraries/slack').Alert;

var firebase = new Firebase();

exports.newTurn = (req, res, next) => {

    return new Promise((resolve, reject) => {

        //Get the match ID from global_state
        firebase.get('global_state/match_id')
            .then( matchID => {

            //Lookup that match by ID.
            firebase.get('match/' + matchID)
                .then( match => {

                    var turnNumber = match.number_turns;

                    console.log('Old turn #: ', turnNumber);

                    turnNumber++;

                    console.log('New turn #: ', turnNumber);

                    var updates = {
                        "number_turns": turnNumber
                    };

                    console.log('Updated stats: ', updates);

                    //Increment the turn # & write it to DB
                    firebase.update('match/' + matchID, updates)
                        .then( fbResponse => {

                            //Build the details of the slack message
                            var alertDetails = {
                                "username": "A mysterious voice",
                                "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                                //TODO dont hardcode the arena
                                "channel": ("#arena"),
                                "text": "Prepare for battle! A new turn turn has arrived!"
                            };
                            //Create a new slack alert object
                            var channelAlert = new Slack(alertDetails);

                            //Send alert to slack
                            channelAlert.sendToSlack(this.params)
                                .then(() =>{
                                    console.log('Successfully posted to slack')
                                })
                                .catch(error =>{
                                    console.log('Error when sending to slack: ', error)
                                });

                            //Resolve regardless of slack message success
                            resolve(res.status(200));
                        })
                        .catch( err => {
                            console.log('Error when writing to firebase: ', err);
                            reject(res.status(500));
                        });

                });
            });



        //Get the turn # of current match





    });
};