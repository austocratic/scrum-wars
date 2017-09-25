

/*
exports.moveCharacter = (zoneID, zoneName) => {

    var template = {
        "attachments": [
            {

            }
        ]
    };

    template.text = "_You can't perform an action in a zone that your character is not in_";

    template.attachments[0].image_url = "https://scrum-wars.herokuapp.com/assets/fullSize/" + zoneID + ".jpg";

    template.attachments[0].fallback = "Unable to travel to " + zoneName + " at this time";

    template.attachments[0].text = "Would you like to travel to " + zoneName + " now?";
    template.attachments[0].callback_id = "travelDialogueSelection";

    //Create the fields to show
    template.attachments[0].actions = [
        {
            "name": "yes",
            "text": "Yes",
            "type": "button",
            "value": "yes"
        },
        {
            "name": "no",
            "text": "No",
            "type": "button",
            "value": "no"
        }
    ];

    return template;

};*/