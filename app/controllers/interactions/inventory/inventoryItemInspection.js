"use strict";

var Firebase = require('../../../libraries/firebase').Firebase;
var itemDetail = require('../../../components/item/itemDetail').itemDetail;

exports.inventoryItemInspection = payload => {

    var firebase = new Firebase();

    var responseTemplate;

    return new Promise((resolve, reject)=>{

        //get the value of the item selected
        var itemID = payload.actions[0].selected_options[0].value;

        //Use previous selection ID to lookup the item properties
        firebase.get(('item/' + itemID))
            .then( itemProps => {

                //Get the standard itemDetail object
                responseTemplate = itemDetail(itemID, itemProps);

                responseTemplate.attachments[0].callback_id = "profileOptionSelection";

                responseTemplate.attachments[0].actions = [
                    {
                        "name": "inventory",
                        "text": "Back to Inventory",
                        "style": "default",
                        "type": "button",
                        "value": "inventory"
                    }
                ]

            });
    })
};