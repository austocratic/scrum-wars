"use strict";

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var profile = require('../app/controllers/commands/profile');

//var stockImage = require('../app/assets/wizardImage.jpg');

var slackSlashCommand = require('../app/controllers/slackSlashCommand').slackSlashCommand;
var slackRequest = require('../app/controllers/slackRequest');
var interactiveMessages = require('../app/controllers/interactiveMessages').interactiveMessages;
var turns = require('../app/controllers/turns');

var slackInteractiveMessage = require('../app/controllers/slackInteractiveMessage').slackInteractiveMessage;

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var Jimp = require("jimp");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
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
});

//TODO To delete
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
});

router.get('/assets/:folder/:id', function (req, res, next) {

    console.log('folder: ', req.params.folder);

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

router.post('/api/commands',
    async (req, res, next) => {
        console.log('Received a request to /api/commands: ', JSON.stringify(req.body));

        let slackResponseTemplateReturned = await slackRequest.processSlashCommand(req);
        
        console.log('DEBUG: router slackResponseTemplateReturned: ', slackResponseTemplateReturned);

        res.status(200).send(slackResponseTemplateReturned);

    });


//All client interactive-message responses pass through this route
router.post('/api/interactive-messages',
    async (req, res, next) => {
        console.log('Received a request to /api/interactive-messages: ', JSON.stringify(req.body));

        let slackResponseTemplateReturned = await slackRequest.processInteractiveMessage(req);

        console.log('DEBUG: router interactive slackResponseTemplateReturned: ', slackResponseTemplateReturned);

        res.status(200).send(slackResponseTemplateReturned);
});

//All client interactive-message responses pass through this route
router.post('/api/turn/new', (req, res, next) => {
    turns.newTurn(req, res, next);
});

//Routes for getting character avatar
//TODO should not rely on the catch all for getting images
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
