"use strict";


var Character = require('../../models/Character').Character;
var Firebase = require('../../libraries/firebase').Firebase;



exports.InteractiveMessages = (req, res, next) => {

    var messagePayload = JSON.parse(req.body.payload);

    console.log('Incoming interactive message, parsed body: ', messagePayload);

    var messageResponse = determineResponse();



    //Read callback to determine what path to take
    function determineResponse(){
        switch(messagePayload.callback_id){

            case 'characterClass':

                var charProps = {
                    character: {
                        strength: 15,
                        stamina: 10,
                        class: messagePayload.actions[0].value
                    }
                };

                console.log('Creating character with properties: ', charProps);

                //write to DB
                var firebase = new Firebase();

                firebase.create(charProps)
                    .then( fbResponse => {
                        console.log('fbResponse: ', fbResponse)
                    })
                    .catch( err => {
                        console.log('Error when writing to firebase: ', err)
                    });

                //Respond with next question

                return {
                    "text": "you made your selection"
                };

                break;

            default:

                return "ERROR: option not available"
        }
    }

    res.status(200).send(messageResponse);
};