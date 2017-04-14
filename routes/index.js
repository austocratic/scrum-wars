var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var profile = require('../app/controllers/commands/profile');
var actionList = require('../app/controllers/action/PostActionList');
var action = require('../app/controllers/action/PostAction');
var generate = require('../app/controllers/commands/generate');
var interact = require('../app/controllers/interactiveMessages/interactiveMessages');

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/api/profile', function(req, res, next) {
    profile.profile(req, res, next);
});

router.post('/api/actionList', function(req, res, next) {
    actionList.PostActionList(req, res, next);
});

router.post('/api/action', (req, res, next) => {
    action.PostAction(req, res, next);
});

router.post('/api/commands/generate', (req, res, next) => {
    generate.generate(req, res, next);
});

router.post('/api/interactive-messages', (req, res, next) => {
    interact.InteractiveMessages(req, res, next);
});


/*
router.post('/api/action', (req, res, next) => {

    console.log('req before parse: ', req.body);


    next();

    //action.PostAction(req, res, next);
},

    urlencodedParser,

(req, res, next) => {

    console.log('req before parse 2: ', req.body);

    //action.PostAction(req, res, next);
});*/
/*
router.post('/api/action', (req, res, next) => {

        console.log('req before parse: ', req.body);

        var parsedBody = JSON.parse(req.body.payload);

        console.log('parsed body: ', parsedBody);

        console.log('Action: ', parsedBody.actions[0].name);

        //next();

        //action.PostAction(req, res, next);
});*/

module.exports = router;
