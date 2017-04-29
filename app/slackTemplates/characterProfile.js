

exports.characterProfile = payload => {

    return {
        "attachments": [
            {

                "image_url": "https://scrum-wars.herokuapp.com/file/unknown_character.jpg",
                "fields": [
                    {
                        "title": "Profile",
                        "value": "Montaigne",
                        "short": false
                    }
                ]
            },
            {
                "title": "Character Stats",
                "fields": [
                ]
            }
        ]
    };
};
