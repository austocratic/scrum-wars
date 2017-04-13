

exports.PostActionList = (req, res, next) => {

    var slackResponse = {
        "attachments": [
            {
                "text": "Choose an action",
                "fallback": "You are unable to choose an action",
                "callback_id": "wopr_game",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "action",
                        "text": "Attack",
                        "style": "danger",
                        "type": "button",
                        "value": "attack"/*,
                     "confirm": {
                     "title": "Are you sure?",
                     "text": "This action will put your character on the offensive!",
                     "ok_text": "Yes",
                     "dismiss_text": "No"
                     }*/
                    },
                    {
                        "name": "action",
                        "text": "Defend",
                        "style": "primary",
                        "type": "button",
                        "value": "defend"/*,
                     "confirm": {
                     "title": "Are you sure?",
                     "text": "This action will defend your character from possible attacks!",
                     "ok_text": "Yes",
                     "dismiss_text": "No"
                     }*/
                    }
                ]
            }
        ]
    };

    res.status(200).send(slackResponse);
};