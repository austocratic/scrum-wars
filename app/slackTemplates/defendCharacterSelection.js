


exports.defendCharacterSelection = payload => {

    return {
        "attachments": [
            {
                "text": "You raise your shield and enter a defensive stance!",
                "fallback": "You are unable to choose an action",
                "callback_id": "defendCharacterSelection",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": []
            }
        ]
    };

};