


exports.characterSelectionClass = payload => {
    
    return {
        "attachments": [
            {
                "text": "Choose a character class",
                "fallback": "You are unable to choose an action",
                "callback_id": "characterSelectionPicture",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "warrior",
                        "text": "Warrior",
                        "style": "danger",
                        "type": "button",
                        "value": "warrior"

                    },
                    {
                        "name": "wizard",
                        "text": "Wizard",
                        "style": "primary",
                        "type": "button",
                        "value": "wizard"
                    }
                ]
            }
        ]
    };
    
    
    
    /*
    return new Promise( (resolve, reject) => {

        var charProps = {

            user_id: payload.user.id,
            strength: 15,
            stamina: 10,
            class: payload.actions[0].value

        };

        console.log('Creating character with properties: ', charProps);

        //write to DB
        var firebase = new Firebase();

        //Need to verify the property schema before writing to DB
        
        firebase.create('character', charProps)
            .then( fbResponse => {
                console.log('fbResponse: ', fbResponse);
                resolve();
            })
            .catch( err => {
                console.log('Error when writing to firebase: ', err);
                reject(err);
            });
    });*/
};