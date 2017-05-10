"use strict";

//This index file contains references to all the interaction files
var interactions = require('./interactions/interactionsIndex').interactionsIndex;
var Firebase = require('../libraries/firebase').Firebase;

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

                    //Now update the character with new properties
                    firebase.update('global_state/' + matchID, updates)
                        .then( fbResponse => {
                            console.log('interaction characterSelectionPicture fbResponse: ', fbResponse);
                            resolve(res.status(200));
                        })
                        .catch( err => {
                            console.log('Error when writing to firebase: ', err);
                            reject(res.status(500));
                        });

                });
            });



        //Get the turn # of current match


        //Increment the turn # & write it to DB


    });
};