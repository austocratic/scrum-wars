var express = require('express');
var router = express.Router();

var profile = require('../app/controllers/profile/PostProfile');
var actionList = require('../app/controllers/action/PostActionList');
var action = require('../app/controllers/action/PostAction');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/api/profile', function(req, res, next) {
    profile.PostProfile(req, res, next);
});

router.post('/api/actionList', function(req, res, next) {
    actionList.PostActionList(req, res, next);
});

router.post('/api/action', function(req, res, next) {
    action.PostAction(req, res, next);
});

module.exports = router;
