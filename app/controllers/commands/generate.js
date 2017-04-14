
var Firebase = require('../../libraries/firebase').Firebase;


exports.generate = (req, res, next) => {

    var slackResponse = {
        "attachments": [
            {
                "text": "Choose a character class",
                "fallback": "You are unable to choose an action",
                "callback_id": "characterClass",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "warrior",
                        "text": "Warrior",
                        "style": "danger",
                        "type": "button",
                        "value": "warrior"
                  
                    },
                    {
                        "name": "wizard",
                        "text": "Wizard",
                        "style": "primary",
                        "type": "button",
                        "value": "wizard"
                    }
                ]
            }
        ]
    };

    res.status(200).send(slackResponse);
};

