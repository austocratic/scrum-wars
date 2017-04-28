
exports.attackCharacterComplete = payload => {

    return {
        "attachments": [
            {
                "text": "You attack and score a crushing blow!",
                "fallback": "You are unable to choose an action",
                "callback_id": "attackCharacterComplete",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": []
            }
        ]
    };

};