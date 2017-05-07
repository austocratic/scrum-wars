var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var profile = require('../app/controllers/commands/profile');

//var stockImage = require('../app/assets/wizardImage.jpg');

var commands = require('../app/controllers/commands').commands;
var interactiveMessages = require('../app/controllers/interactiveMessages').interactiveMessages;

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

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

router.post('/api/commands', (req, res, next) => {
    commands(req, res, next);
});

//All client interactive-message responses pass through this route
router.post('/api/interactive-messages', (req, res, next) => {
    interactiveMessages(req, res, next);
});


module.exports = router;
