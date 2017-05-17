
var Firebase = require('../../libraries/firebase').Firebase;

//TODO verify that this file can be deleted

exports.profile = (req, res, next) => {
    
    console.log('Called /profile, req.body: ', req.body);
    
    //Get user id making the request

    //Incoming requests have a user_id, use it to determine who's character details should be pulled
    var userID = req.body.user_id;

    //Look up that player's character

    var slackResponse = {
        "attachments": [
            {
                "image_url": "http://orig06.deviantart.net/23db/f/2013/201/4/6/paladin_basic_version_by_thomaswievegg-d6eaz66.jpg",
                "fields": [
                    {
                        "title": "Profile",
                        "value": "Montaigne",
                        "short": false
                    }
                ]
            },
            {
                "fields": [
                    {
                        "title": "Health",
                        //"value": attributes.health,
                        "short": true
                    },
                    {
                        "title": "Attack",
                       // "value": attributes.attack,
                        "short": true
                    }
                ]
            }
        ]
    };

    res.status(200).send(slackResponse);
};