"use strict";

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

//var stockImage = require('../app/assets/wizardImage.jpg');

const slackRequest = require('../app/controllers/slackRequest');
const formatPayload = require('../app/middleware/formatSlackRequest').formatPayload;
//const modifyPayloadForReservedActions = require('../app/middleware/formatSlackRequest').modifyPayloadForReservedActions;
const getGame = require('../app/middleware/getGame').getGame;
const declareGameObjects = require('../app/middleware/declareGameObjects').declareGameObjects;
const updateGameObjectsForReservedActionName = require('../app/middleware/updateGameObjectsForReservedActionName').updateGameObjectsForReservedActionName;
const checkUserPermissions = require('../app/middleware/checkUserPermissions').checkUserPermissions;
const updateGame = require('../app/middleware/updateGame').updateGame;


// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var Jimp = require("jimp");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendStatus(200)
});



/*
//TODO testing jimp
router.get('/jimp', function(req, res, next) {

    Jimp.read("./app/assets/blank_char.jpg")
        .then( blankChar => {

            Jimp.read("./app/assets/to_combine.jpg")
                .then(toCombine => {

                    blankChar.composite(toCombine, 20, 20)
                        .write("./app/assets/newFile.jpg", () => {
                            console.log('wrote the file');

                            //let file = "./app/assets/newFile.jpg";

                            var options = {
                                root: process.cwd() + '/app/assets/',
                                dotfiles: 'deny',
                                headers: {
                                    'x-timestamp': Date.now(),
                                    'x-sent': true
                                }
                            };

                            res.sendFile('newFile.jpg', options, function (err) {
                                if (err) {
                                    console.log('Error when sending file: ', err);
                                    next(err);
                                } else {
                                    console.log('Sent:');
                                }
                            });

                        })


                }).catch(err => {
                console.error('Jimp error: ', err);
            });
        });

    //});
});*/

/*
router.get('/assets/:folder/:id', function (req, res, next) {

    var options = {
        root: process.cwd() + '/app/assets/' + req.params.folder + '/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    var fileName = req.params.id;
    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
});*/

router.post('/api/commands', async (req, res, next) => {
    console.log('Received a request to /api/commands: ', JSON.stringify(req.body));

        let formattedRequest;

        try {
            //formatPayload() attempt to parse the request
            formattedRequest = formatPayload(req);
        } catch(err){
            console.log('ERROR when calling formatPayload: ', err)
        }

        //gets DB state and sets to game.state & calls game.initiateRequest() to calculate values in memory
        let game = await getGame();

        //Declare standard game objects based on the Slack request
        let gameObjects = declareGameObjects(game, formattedRequest);

        //TODO I probably should not tack on the game as a gameObject.  If I do it probably should not happen here
        gameObjects.game = game;

        //Check the user's permission to see if they can access that command
        if(checkUserPermissions(gameObjects.permission, gameObjects.command) === false) {
            return {
                "text": "Sorry but you are not authorized for this command"
            }
        }

        let slackResponseTemplateReturned = await slackRequest.processRequest('command', gameObjects.command, gameObjects);

        //Update game state
        game.updateState();
        console.log('Responded to request to /api/commands: ', JSON.stringify(slackResponseTemplateReturned));
        res.status(200).send(slackResponseTemplateReturned);
    });

//All client interactive-message responses pass through this route
router.post('/api/interactive-messages', async (req, res, next) => {
    console.log('Received a request to /api/interactive-messages: ', JSON.stringify(req.body));

    let formattedRequest;

    try {
        //formatPayload() attempt to parse the request
        formattedRequest = formatPayload(req);
    } catch(err){
        console.log('ERROR when calling formatPayload: ', err)
    }

    let game = await getGame();

    //Declare standard game objects based on the Slack request
    let gameObjects = declareGameObjects(game, formattedRequest);

    //console.log('gameObjects.slackCallback after declare: ', gameObjects.slackCallback);

    updateGameObjectsForReservedActionName(gameObjects);

    //console.log('gameObjects.slackCallback in router BEFORE: ', gameObjects.slackCallback);

    gameObjects.slackCallback = `${gameObjects.slackCallback}:${gameObjects.userActionNameSelection}:${gameObjects.userActionValueSelection}/`;

    //console.log('gameObjects.slackCallback in router AFTER: ', gameObjects.slackCallback);

    //TODO I probably should not tack on the game as a gameObject.  If I do it probably should not happen here
    gameObjects.game = game;

    let slackResponseTemplateReturned = await slackRequest.processRequest(gameObjects.gameContext, gameObjects.userActionNameSelection, gameObjects);

    //Update game state
    //await updateGame(req);
    game.updateState();
    console.log('Responded to request to /api/interactive-messages: ', JSON.stringify(slackResponseTemplateReturned));
    res.status(200).send(slackResponseTemplateReturned);
});

//All client interactive-message responses pass through this route

//Routes for getting character avatar
//TODO should not rely on the catch all for getting images. this gets the avatar image
//TODO Remove this and move it all to public images
/* TESTING REMOVING
router.all('*', function (req, res, next) {

    //console.log('Called .all router, req.params: ', req.params['0']);

    let options = {
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    res.sendFile(process.cwd() + req.params['0'], options, function (err) {
        if (err) {
            next(err);
        } else {
            //console.log('Sent:');
        }
    });
});
*/

module.exports = router;
