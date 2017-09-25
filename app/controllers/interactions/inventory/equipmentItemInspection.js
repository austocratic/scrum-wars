/*"use strict";

var Firebase = require('../../../libraries/firebase').Firebase;
var Item = require('../../../models/Item').Item;
var itemDetail = require('../../../components/item/itemDetail').itemDetail;

var firebase = new Firebase();

exports.equipmentItemInspection = payload => {

    var responseTemplate;

    return new Promise((resolve, reject)=>{

        //get the value of the item selected or "back" if the user selected to go back
        var itemID = payload.actions[0].value;

        console.log('itemID of equipmentItemInspection: ', itemID);

        var localItem = new Item();
        localItem.setByID(itemID)
        //firebase.get(('item/' + itemID))
            .then( () => {

                //Get the standard itemDetail object
                responseTemplate = itemDetail(localItem.props.id, localItem.props);
                
                //Add in a back button
                responseTemplate.attachments[0].actions = [
                    //Add in a "unequip" button
                    {
                        "name": "unequip_item",
                        "text": "Unequip Item",
                        "style": "default",
                        "type": "button",
                        "value": localItem.props.id
                    },
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

*/