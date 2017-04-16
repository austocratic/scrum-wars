"use strict";


var interactions = require('./interactions').interactions;



exports.interactiveMessages = (req, res, next) => {

    //TODO: bad to use try/catch here.  Need to read the content type header and act accordingly
    //Parse the payload of the message
    var messagePayload;
    try {
        messagePayload = JSON.parse(req.body.payload);
    } catch(err){
        messagePayload = req.body.payload;
    }

    //Get the callback property
    var callback = messagePayload.callback_id;

    getInteraction(callback)
        .then( messageResponse =>{
            res.status(200).send(messageResponse);
        })
        .catch( err => {
            res.status(200).send('Uh oh! Server error: ', err);
        });

    function getInteraction(callbackInput){
        return new Promise((resolve, reject) => {
            switch(callbackInput) {

                case 'characterSelectionNew':
                    
                    console.log('case characterSelectionNew in interactive message');

                    interactions('characterSelectionClass')
                        .then( interactionResponse => {
                            resolve(interactionResponse)
                        });
                    
                    break;

                case 'characterSelectionClass':

                    interactions('characterSelectionPicture')
                        .then( interactionResponse => {
                            resolve(interactionResponse)
                        });
                    break;
                

                default:

            }
        });
    }
    
    
};