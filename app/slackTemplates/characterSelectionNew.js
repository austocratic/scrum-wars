




exports.characterSelectionNew = payload => {

    return {
        "attachments": [
            {
                "text": "Hail traveler, are you ready to embark on a NEW faithful journey to lands uncharted and depths unknown?  All your previous progress will be lost",
                "fallback": "You are unable to choose an action",
                "callback_id": "characterSelectionNew",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "yes",
                        "text": "I head the call",
                        "style": "primary",
                        "type": "button",
                        "value": "yes"

                    },
                    {
                        "name": "no",
                        "text": "Nay, I shall continue on my current path",
                        "style": "danger",
                        "type": "button",
                        "value": "no"
                    }
                ]
            }
        ]
    };
};
