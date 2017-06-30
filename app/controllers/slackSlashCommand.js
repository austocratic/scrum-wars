"use strict";


var interactions = require('./interactions').interactions;

var Game = require('../models/Game').Game;


//Incoming commands have a command property defining which command was called
exports.slackSlashCommand = async (req, res, next) => {
    
    //TODO need validation to ensure request came from slack and is structured correctly

    //TODO: bad to use try/catch here.  Need to read the content type header and act accordingly
    //Parse the payload of the message
    /*
    var messagePayload;
    try {
        messagePayload = JSON.parse(req.body);
    } catch(err){
        messagePayload = req.body;
    }*/
    
    console.log('called slackSlashCommand');

    var slackPayload = req.body;

    var slackUserID, slackChannelID, slackTextInput;

    console.log('slackPayload: ', slackPayload);
    
    //Get the user ID property (formatted differently based on /command or callback)

    //TODO: I think that all user ids come in this format in slash commands
    slackUserID = slackPayload.user_id;

    slackChannelID = slackPayload.channel_id;
    
    slackTextInput = slackPayload.text;

    /*
    try {
        userID = slackPayload.user.id;
    } catch(err){
        //Slash commands are formatted in this way
        userID = slackPayload.user_id;
    }*/
    
    //Get the command property
    var command = slackPayload.command;

    //Get game's current state
    var game = new Game();

    //Set the game state locally
    await game.getState();

    var responseTemplate = await processRequest(command, slackUserID, slackChannelID);

    //Overwrites with updated local stats
    //TODO add the update state call back in for real updates
    await game.updateState();

    //Send success response
    res.status(200).send();

    return responseTemplate;

    //Lookup the command and return a response
    async function processRequest(requestCommand, requestSlackUserID, requestSlackChannelID) {
        switch (requestCommand) {

            case '/action':

                console.log('Called /action');
                //game

                break;

            case '/generate':

                console.log('Called /generate');
                //Return the new character confirmation template
            return {
                "attachments": [
                {
                    "text": "Hail traveler, are you ready to embark on a NEW faithful journey to lands uncharted and depths unknown?  All your previous progress will be lost",
                    "fallback": "You are unable to choose an action",
                    "callback_id": "characterSelectionNew",
                    "color": "#3AA3E3",
                    "attachment_type": "default",
                    "actions": [
                        {
                            "name": "yes",
                            "text": "I head the call",
                            "style": "primary",
                            "type": "button",
                            "value": "yes"

                        },
                        {
                            "name": "no",
                            "text": "Nay, I shall continue on my current path",
                            "style": "danger",
                            "type": "button",
                            "value": "no"
                        }
                    ]
                }
            ]
            };

                break;

            case '/profile':

                console.log('Called /profile');
                return game.characterProfile(requestSlackUserID, requestSlackChannelID);

                break;

            case '/travel':

                console.log('Called /travel');
                return game.characterTravel(requestSlackUserID, requestSlackChannelID);
                
                break;

            case '/name':

                console.log('Called /name');
                return game.characterName(requestSlackUserID, slackTextInput);

                break;


            default:
        }
    }



    /*
    //Read the command and call the corresponding interaction
    getInteraction(command, messagePayload)
        .then( messageResponse =>{
            res.status(200).send(messageResponse);
        })
        .catch( err => {
            res.status(200).send('Uh oh! Server error: ', err);
        });
    
    async function getInteraction(commandInput, messagePayloadInput){


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
    }*/
};

