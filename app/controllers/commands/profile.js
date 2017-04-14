
var Firebase = require('../../libraries/firebase').Firebase;


exports.profile = (req, res, next) => {
    
    console.log('Called /profile, req.body: ', req.body);
    
    //Get user id making the request

    //Need to look at user making request - get their id.

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