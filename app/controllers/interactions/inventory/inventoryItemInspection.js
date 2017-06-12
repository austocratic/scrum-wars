"use strict";

var Firebase = require('../../../libraries/firebase').Firebase;
var Item = require('../../Item').Item;
var itemDetail = require('../../../components/item/itemDetail').itemDetail;

var firebase = new Firebase();

exports.inventoryItemInspection = payload => {
    
    var responseTemplate;

    return new Promise((resolve, reject)=>{

        //get the value of the item selected
        var itemID = payload.actions[0].selected_options[0].value;

        var localItem = new Item();
        localItem.setByID(itemID)
        
        
        //Use previous selection ID to lookup the item properties
        //firebase.get(('item/' + itemID))
            .then( () => {

                //Get the standard itemDetail object
                responseTemplate = itemDetail(localItem.props.id, localItem.props);

                //Add in a "equip" button
                responseTemplate.attachments[0].actions = [
                    {
                        "name": "equip_item",
                        "text": "Equip Item",
                        "style": "default",
                        "type": "button",
                        "value": localItem.props.id
                    }
                ];

                //Add in a back button
                responseTemplate.attachments[0].actions = [
                    {
                        "name": "inventory",
                        "text": "Back to Inventory",
                        "style": "default",
                        "type": "button",
                        "value": "inventory"
                    }
                ];

                //Set the callback to be read by interactiveMessages.js
                responseTemplate.attachments[0].callback_id = "profileOptionSelection";

                resolve(responseTemplate);

            });
    })
};