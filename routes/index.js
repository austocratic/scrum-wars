"use strict";

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

//var stockImage = require('../app/assets/wizardImage.jpg');

const slackRequest = require('../app/controllers/slackRequest');
const formatPayload = require('../app/middleware/formatSlackRequest').formatPayload;
const modifyPayloadForReservedActions = require('../app/middleware/formatSlackRequest').modifyPayloadForReservedActions;
const getGame = require('../app/middleware/getGame').getGame;
const declareGameObjects = require('../app/middleware/declareGameObjects').declareGameObjects;
const checkUserPermissions = require('../app/middleware/checkUserPermissions').checkUserPermissions;
const updateGame = require('../app/middleware/updateGame').updateGame;


const turns = require('../app/controllers/turns');

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

//TODO To delete
/*
router.get('/file/:name', function (req, res, next) {

    var options = {
        root: process.cwd() + '/app/assets/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    var fileName = req.params.name;
    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
});*/

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
});

router.post('/api/commands',
    async (req, res, next) => {
        console.log('Received a request to /api/commands: ', JSON.stringify(req.body));

        //payload.actions[0].name;
        try {
            req.payload = formatPayload(req);
        } catch(err){
            console.log('ERROR when calling formatPayload: ', err)
        }

        console.log('DEBUG /commands req.payload: ', JSON.stringify(req.payload));

        next();
    }, async(req, res, next) => {

        let gameState = await getGame();

        //Get the game state and calculate values in memory
        req.gameObjects = {
            game: gameState
        };

        next();
    }, async(req, res, next) => {

        //Declare objects based on the request
        declareGameObjects(req);

        next();
    }, async(req, res, next) => {

        //Declare objects based on the request
        checkUserPermissions(req.gameObjects.permission);

        next();
    }, async(req, res, next) => {

        //let slackResponseTemplateReturned = await slackRequest.processSlashCommand(req.payload);
        //(gameContext, userSelection, opts)
        //Command is hard coded for slash commands
        let slackResponseTemplateReturned = await slackRequest.processRequest('command', req.gameObjects.command, req.gameObjects);

        //Update game state
        await updateGame(req);

        console.log('/api/commands router sending response: ', JSON.stringify(slackResponseTemplateReturned));
        res.status(200).send(slackResponseTemplateReturned);

    });


//All client interactive-message responses pass through this route
router.post('/api/interactive-messages', (req, res, next) => {
    console.log('Received a request to /api/interactive-messages: ', JSON.stringify(req.body));

        //payload.actions[0].name;
        try {
            req.payload = formatPayload(req);
        } catch(err){
            console.log('ERROR when calling formatPayload: ', err)
        }

        //Pass to next router
        next();
    },(req, res, next) => {

        //Modify the request based on reserved words or format the callback
        try{
            modifyPayloadForReservedActions(req);
        }catch(err){
            console.log('ERROR when calling modifyPayloadForReservedActions: ', err)
        }

    //Pass to next router
    next();
}, async(req, res, next) => {

    let slackResponseTemplateReturned;

    console.log('DEBUG interactive-messages router received req.payload: ', JSON.stringify(req.payload));

        if (req.payload.command){
            slackResponseTemplateReturned = await slackRequest.processSlashCommand(req.payload);
        } else {
            slackResponseTemplateReturned = await slackRequest.processInteractiveMessage(req.payload);
        }

        console.log('/api/interactive-messages router sending response: ', JSON.stringify(slackResponseTemplateReturned));
        res.status(200).send(slackResponseTemplateReturned);
    });

/*
router.post('/api/interactive-messages',
    async (req, res, next) => {


        let slackResponseTemplateReturned = await slackRequest.processInteractiveMessage(req);

        console.log('/api/interactive-messages router sending response: ', JSON.stringify(slackResponseTemplateReturned));
        res.status(200).send(slackResponseTemplateReturned);
});*/

//All client interactive-message responses pass through this route
router.post('/api/turn/new', (req, res, next) => {
    turns.newTurn(req, res, next);
});

//Routes for getting character avatar
//TODO should not rely on the catch all for getting images. this gets the avatar image
//TODO Remove this and move it all to public images
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


module.exports = router;
