


exports.characterSelectionPicture = payload => {

    return {
        "attachments": [
            {
                "text": "Choose a character profile picture",
                "fallback": "You are unable to choose an action",
                "callback_id": "characterSelectionPicture",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "image_url": "https://sites.google.com/site/fagewiki/_/rsrc/1451615340298/specializations/warrior-specializations/paladin/Paladin.png?height=361&width=400",
                "actions": [
                    {
                        "name": "warrior",
                        "text": "Paladin",
                        "style": "default",
                        "type": "button",
                        "value": "1"
                    }
                ]
            },
            {
                "text": "Choose a character profile picture",
                "fallback": "You are unable to choose an action",
                "callback_id": "characterSelectionPicture",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "image_url": "https://s-media-cache-ak0.pinimg.com/originals/7f/44/8d/7f448dbb91ff3fa441876c26e441dd7e.jpg",
                "actions": [
                    {
                        "name": "warrior",
                        "text": "Shadow Knight",
                        "style": "default",
                        "type": "button",
                        "value": "1"
                    }
                ]
            },
            {
                "text": "Choose a character profile picture",
                "fallback": "You are unable to choose an action",
                "callback_id": "characterSelectionPicture",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "image_url": "https://s-media-cache-ak0.pinimg.com/originals/d5/3d/f6/d53df60a068d03e6bcbe89ae280999de.jpg",
                "actions": [
                    {
                        "name": "warrior",
                        "text": "Rogue",
                        "style": "default",
                        "type": "button",
                        "value": "1"
                    }
                ]
            }
        ]
    };
};
