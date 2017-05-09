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

    //Get the interaction then write to DB then respond to client
    getInteraction(callback, messagePayload)
        .then( messageResponse =>{
            res.status(200).send(messageResponse);
        })
        .catch( err => {
            res.status(200).send('Uh oh! Server error: ', err);
        });

    //Notes: currently I'm only sending the callbackInput to the getInteraction function.  Where should the DB call come from?
    //Getting data from the DB to populate in the template should probably happen in the template itself
    //But how about writing to the DB?

    //Get the next template to return to the client
    function getInteraction(callbackInput, messagePayloadInput){
        return new Promise((resolve, reject) => {
            switch(callbackInput) {

                case 'actionMenu':

                    interactions('playerActionSelection', messagePayloadInput)
                        .then( interactionResponse => {
                            resolve(interactionResponse)
                        });

                    break;
                
                case 'characterSelectionNew':

                    interactions('characterSelectionClass', messagePayloadInput)
                        .then( interactionResponse => {
                            resolve(interactionResponse)
                        });
                    
                    break;

                case 'characterSelectionClass':

                    interactions('characterClassSelectionConfirmation', messagePayloadInput)
                        .then( interactionResponse => {
                            resolve(interactionResponse)
                        });
                    break;


                case 'attackCharacterSelection':

                    interactions('playerAttack', messagePayloadInput)
                        .then( interactionResponse => {
                            resolve(interactionResponse)
                        });
                    break;

                case 'shopCharacterSelection':

                    interactions('shopItemSelection', messagePayloadInput)
                        .then( interactionResponse => {
                            resolve(interactionResponse)
                        });
                    break;

                case 'shopPurchaseConfirm':

                    interactions('shopPurchaseConfirm', messagePayloadInput)
                        .then( interactionResponse => {
                            resolve(interactionResponse)
                        });
                    break;

                case 'profileOptionSelection':

                    interactions('profileOptionSelection', messagePayloadInput)
                        .then( interactionResponse => {
                            resolve(interactionResponse)
                        });
                    break;

                default:

            }
        });
    }
    
    
};