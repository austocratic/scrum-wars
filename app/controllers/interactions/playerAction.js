"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var actionMenu = require('../../slackTemplates/actionMenu').actionMenu;

exports.playerAction = payload => {

    return new Promise( (resolve, reject) => {

        //Get the channel id
        var channelID = payload.channel_id;

        var availableActions;

        var template = actionMenu();

        console.log('Channel ID: ', channelID);

        //Set the availableActions property depending on the zone
        //TODO Should not hard code this.  Should use DB values here
        switch(channelID) {

            //Zone = town
            case 'C4Z4P1BUH':

                //Overwrite template default callback
                //template.callback_id = 'townAction';

                //Set the available actions
                availableActions = {
                    "actions": [
                        {
                            "name": "shop",
                            "text": "Shop",
                            "style": "default",
                            "type": "button",
                            "value": "shop"
                        }
                    ]
                };


                break;

            //Zone = arena
            case 'C4Z7F8XMW':

                //Overwrite template default callback
                //template.callback_id = 'arenaAction';
                
                //Set the available actions
                availableActions = [
                        {
                            "name": "attack",
                            "text": "Attack",
                            "style": "default",
                            "type": "button",
                            "value": "attack"
                        },
                        {
                            "name": "defend",
                            "text": "Defend",
                            "style": "default",
                            "type": "button",
                            "value": "defend"
                        }
                    ];

                break;

            default:

                //Resolve default template
                resolve(template);
        }

        console.log('availableActions: ', availableActions);

        //Overwrite template default
        template.attachments[0].text = 'Choose an action';

        template.attachments[0].actions = availableActions;

        console.log('Modified template: ', template);

        resolve(template);

    })
};