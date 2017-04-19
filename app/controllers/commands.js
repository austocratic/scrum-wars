"use strict";


var interactions = require('./interactions').interactions;


//Incoming commands have a command property defining which command was called
exports.commands = (req, res, next) => {
    
    //TODO need validation to ensure request came from slack and is structured correctly

    //TODO: bad to use try/catch here.  Need to read the content type header and act accordingly
    //Parse the payload of the message
    var messagePayload;
    try {
        messagePayload = JSON.parse(req.body);
    } catch(err){
        messagePayload = req.body;
    }
    
    //Get the command property
    var command = messagePayload.command;

    //Read the command and call the corresponding interaction
    getInteraction(command, messagePayload)
        .then( messageResponse =>{
            res.status(200).send(messageResponse);
        })
        .catch( err => {
            res.status(200).send('Uh oh! Server error: ', err);
        });
    
    function getInteraction(commandInput, messagePayloadInput){
        return new Promise((resolve, reject) => { 
            switch(commandInput) {

                case '/action':

                    interactions('playerAction', messagePayloadInput)
                        .then( interactionResponse => {
                            resolve(interactionResponse)
                        });
                    break;
                
                case '/generate':

                    interactions('characterSelectionNew', messagePayloadInput)
                        .then( interactionResponse => {
                            resolve(interactionResponse)
                        });
                    break;

                case '/profile':

                    interactions('characterProfile', messagePayloadInput)
                        .then( interactionResponse => {
                            resolve(interactionResponse)
                        });
                    break;
                
                case '/travel':

                    interactions('travel', messagePayloadInput)
                        .then( interactionResponse => {
                            resolve(interactionResponse)
                        });
                    break;
                
                case '/name':

                    interactions('nameCharacter', messagePayloadInput)
                        .then( interactionResponse => {
                            resolve(interactionResponse)
                        });
                    break;
                    

                default:
            }
        });
    }
};

