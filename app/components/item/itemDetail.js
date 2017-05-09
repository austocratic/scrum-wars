"use strict";



exports.itemDetail = (itemID, itemProps) => {

    var template = {
        "attachments": [
            
        ]
    };

    template.attachments[0].thumb_url = "https://scrum-wars.herokuapp.com/assets/thumb/" + itemID + ".jpg";

    //Create the fields to show
    template.attachments[0].fields = [
        {
            "title": itemProps.name,
            "short": false
        }
    ];

    //Iterate through the object adding to the template
    for (var prop in itemProps) {
        //console.log(`obj.${prop} = ${itemProps[prop]}`);

        template.attachments[0].fields.push({
            "title": prop,
            "value": `${itemProps[prop]}`,
            "short": true
        });
    }

    return template;

};