var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var profile = require('../app/controllers/commands/profile');
var actionList = require('../app/controllers/action/PostActionList');
var action = require('../app/controllers/action/PostAction');


var commands = require('../app/controllers/commands').commands;
var interactiveMessages = require('../app/controllers/interactiveMessages').interactiveMessages;

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/api/commands', (req, res, next) => {
    commands(req, res, next);
});

//All client interactive-message responses pass through this route
router.post('/api/interactive-messages', (req, res, next) => {
    interactiveMessages(req, res, next);
});


module.exports = router;
