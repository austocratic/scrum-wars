


exports.attackMenu = payload => {

    return {
        "attachments": [
            {
                "text": "You ready your blade for a strike, who do you wish to attack?",
                "fallback": "You are unable to choose an action",
                "callback_id": "attackMenu",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": []
            }
        ]
    };

};