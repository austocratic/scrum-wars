


exports.characterSelectionPicture = payload => {

    return {
        "attachments": [
            {
                "image_url": "http://orig06.deviantart.net/23db/f/2013/201/4/6/paladin_basic_version_by_thomaswievegg-d6eaz66.jpg",
                "fields": [
                    {
                        "title": "Profile picture",
                        "value": "Montaigne",
                        "short": false
                    }
                ]
            },
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
