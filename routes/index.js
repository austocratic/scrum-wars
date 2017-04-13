var express = require('express');
var router = express.Router();

var profile = require('../app/controllers/profile/PostProfile');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/api/profile', function(req, res, next) {
    profile.PostProfile(req, res, next);
});

module.exports = router;
