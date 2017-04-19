"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var actionMenu = require('../../slackTemplates/actionMenu').actionMenu;

exports.playerAction = payload => {

    return new Promise( (resolve, reject) => {

        //Get the channel id
        var channelID = payload.channel_id;

        var availableActions;

        var template = actionMenu();

        //Set the availableActions property depending on the zone
        //TODO Should not hard code this.  Should use DB values here
        switch(channelID) {

            //Zone = town
            case '':

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
            case '':

                //Overwrite template default callback
                //template.callback_id = 'arenaAction';
                
                //Set the available actions
                availableActions = {
                    "actions": [
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
                    ]
                };

                break;

            default:

                //Resolve default template
                resolve(template);
        }

        //Overwrite template default
        template.attachments[0].text = 'Choose an action';

        //TODO need to use method for adding an object
        template.attachments[0].push(availableActions);

        resolve(template);

    })
};