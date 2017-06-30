"use strict";


var interactions = require('./interactions').interactions;

var Game = require('../models/Game').Game;

var slackTemplates = require ('../slackTemplates');


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
    res.status(200).send(responseTemplate);

    //Lookup the command and return a response
    async function processRequest(requestCommand, requestSlackUserID, requestSlackChannelID) {
        switch (requestCommand) {

            case '/action':

                console.log('Called /action');
                return game.getAvailableActions(requestSlackUserID, requestSlackChannelID);

                break;

            case '/generate':

                console.log('Called /generate');
                //Return the new character confirmation template
            return slackTemplates.generateCharacterConfirmation;

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

};
