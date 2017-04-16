


exports.characterSelectionPicture = payload => {

    return {
        "attachments": [
            {
                "text": "Choose a character profile picture",
                "fallback": "You are unable to choose an action",
                "callback_id": "characterSelectionPicture",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "warrior",
                        "text": "Option 1",
                        "style": "danger",
                        "type": "button",
                        "value": "1"
                    },
                    {
                        "name": "wizard",
                        "text": "Option 2",
                        "style": "primary",
                        "type": "button",
                        "value": "2"
                    }
                ]
            }
        ]
    };
};
