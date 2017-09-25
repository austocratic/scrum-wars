/*"use strict";
var Firebase = require('../../libraries/firebase').Firebase;
var shopPurchaseConfirm = require('../../slackTemplates/shopPurchaseConfirm').shopPurchaseConfirm;

var itemDetail = require('../../components/item/itemDetail').itemDetail;

exports.shopItemSelection = payload => {

    var firebase = new Firebase();
    
    var responseTemplate;

    return new Promise((resolve, reject) => {

        //get the value of the item selected
        var purchaseSelection = payload.actions[0].selected_options[0].value;

        //Use previous selection ID to lookup the item properties
        firebase.get(('item/' + purchaseSelection))
            .then( itemProps => {

                //Get the standard itemDetail object
                responseTemplate = itemDetail(purchaseSelection, itemProps);

                //Add in respond fields to the template, "yes" will pass the item ID to the next screen
                responseTemplate.attachments[0].actions = [{
                    "name": "purchaseConfirm",
                    "text": "Yes, I'll take it!",
                    "type": "button",
                    //Use the item's ID to pass to the next page where DB writing will take place
                    "value": purchaseSelection
                },
                {
                    "name": "purchaseConfirm",
                    "text": "No thanks",
                    "type": "button",
                    "style": "danger",
                    "value": "no"
                }];

                //Set the callback to be read by interactiveMessages.js
                responseTemplate.attachments[0].callback_id = "shopPurchaseConfirm";
                
                resolve(responseTemplate)
            });
    })
};*/