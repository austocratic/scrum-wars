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
                template.attachments[0].actions = [
                        {
                            "name": "shop",
                            "text": "Shop",
                            "style": "default",
                            "type": "button",
                            "value": "shop"
                        }
                    ];
                
                break;

            //Zone = arena
            case 'C4Z7F8XMW':

                //Overwrite template default callback
                //template.callback_id = 'arenaAction';

                template.attachments = [
                    //Attack oriented actions
                    {
                        "title": "Attack actions",
                        "fallback": "You are unable to choose an action",
                        "callback_id": "actionMenu",
                        "color": "#3AA3E3", //TODO change to attack oriented color
                        "attachment_type": "default",
                        //TODO add tiny_url for attack symbol
                        "actions": [
                            {
                                "name": "attack",
                                "text": "Attack",
                                "style": "default",
                                "type": "button",
                                "value": "attack"
                            }]
                    },
                    //Defense oriented actions
                    {
                        "title": "Defensive actions",
                        "text": "No actions available in this zone", //Default value to be overwritten
                        "fallback": "You are unable to choose an action",
                        "callback_id": "actionMenu",
                        "color": "#3AA3E3", //TODO change to defense oriented color
                        "attachment_type": "default",
                        //TODO add tiny_url for defense symbol
                        "actions": [
                            {
                                "name": "defend",
                                "text": "Defend",
                                "style": "default",
                                "type": "button",
                                "value": "defend"
                            }]
                    }
                    //Magic oriented actions (to add)
                ];

                break;

            default:

                //Resolve default template
                resolve(template);
        }

        //Overwrite template default
        template.text = 'Choose an action';

        resolve(template);

    })
};