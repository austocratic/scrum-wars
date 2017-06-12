"use strict";

var Firebase = require('../../../libraries/firebase').Firebase;
var Item = require('../../Item').Item;
var itemDetail = require('../../../components/item/itemDetail').itemDetail;

var firebase = new Firebase();

exports.equipmentItemInspection = payload => {

    var responseTemplate;

    return new Promise((resolve, reject)=>{

        //get the value of the item selected or "back" if the user selected to go back
        var itemID = payload.actions[0].value;

        /*
        //If the player chose "back" return the profile template
        if (itemID === "back"){
            characterProfile(payload)
                .then( charProfile =>{
                    resolve(charProfile)
                })
        }*/

        //Use previous selection ID to lookup the item properties
        firebase.get(('item/' + itemID))
            .then( itemProps => {

                //Get the standard itemDetail object
                responseTemplate = itemDetail(itemID, itemProps);

                
                
                //Add in a back button
                responseTemplate.attachments[0].actions = [
                    {
                        "name": "equipment",
                        "text": "Back to equipment",
                        "style": "default",
                        "type": "button",
                        "value": "equipment"
                    }
                ];

                //Set the callback to be read by interactiveMessages.js
                responseTemplate.attachments[0].callback_id = "profileOptionSelection";

                resolve(responseTemplate);

            });
    })
};