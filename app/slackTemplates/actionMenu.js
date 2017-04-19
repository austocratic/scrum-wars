


exports.actionMenu = payload => {

    return {
        "attachments": [
            {
                "text": "No actions available in this zone", //Default value to be overwritten
                "fallback": "You are unable to choose an action",
                "callback_id": "actionMenu",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": []
            }
        ]
    };

};