

exports.PostActionList = (req, res, next) => {

    var attributes = {
        health: 10,
        attack: 15
    };

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
                        "value": attributes.health,
                        "short": true
                    },
                    {
                        "title": "Attack",
                        "value": attributes.attack,
                        "short": true
                    }
                ]
            }
        ]
    };

    res.status(200).send(slackResponse);
};