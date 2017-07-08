"use strict";

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

    var responseTemplate = getResponseTemplate(command, slackUserID, slackChannelID);

    console.log('responseTemplate to update: ', JSON.stringify(responseTemplate));

    //Overwrites with updated local props
    await game.updateState();

    //Send success response
    res.status(200).send(responseTemplate);

    //Lookup the command and return a response
    function getResponseTemplate(requestCommand, requestSlackUserID, requestSlackChannelID) {

        var slackTemplate;

        switch (requestCommand) {

            case '/action':

                console.log('Called /action');

                slackTemplate = game.getAvailableActions(requestSlackUserID, requestSlackChannelID);

                slackTemplate.attachments[0].callback_id = 'actionList';

                return slackTemplate;

                break;

            case '/generate':

                console.log('Called /generate');
                //Return the new character confirmation template
                slackTemplate = slackTemplates.generateCharacterConfirmation;

                slackTemplate.attachments[0].callback_id = 'characterConfirmation';

                return slackTemplate;

                break;

            case '/profile':

                console.log('Called /profile');
                slackTemplate = game.characterProfile(requestSlackUserID, requestSlackChannelID);

                //attachment 0 = character image
                //attachment 1 = character stats
                slackTemplate.attachments[2].callback_id = 'characterProfile';

                return slackTemplate;

                break;

            case '/travel':

                console.log('Called /travel');

                //Dont set callback ID here, no interactive message to return
                return game.characterTravel(requestSlackUserID, requestSlackChannelID);

                break;

            case '/name':

                console.log('Called /name');

                //Dont set callback ID here, no interactive message to return
                return game.characterName(requestSlackUserID, slackTextInput);

                break;

            default:
        }
    }

};

