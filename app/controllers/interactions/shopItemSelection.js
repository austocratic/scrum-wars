"use strict";
var Firebase = require('../../libraries/firebase').Firebase;
var shopPurchaseConfirm = require('../../slackTemplates/shopPurchaseConfirm').shopPurchaseConfirm;

var itemDetail = require('../../components/item/itemDetail').itemDetail;

exports.shopItemSelection = payload => {

    var firebase = new Firebase();

    //var responseTemplate = shopPurchaseConfirm();
    var responseTemplate;

    return new Promise((resolve, reject) => {

        //get the value of the item selected
        var purchaseSelection = payload.actions[0].selected_options[0].value;

        //Use previous selection ID to lookup the item properties
        firebase.get(('item/' + purchaseSelection))
            .then( itemProps => {

                console.log('ItemProps', itemProps);

                
                responseTemplate = itemDetail(purchaseSelection, itemProps);

                /*
                responseTemplate.attachments[0].thumb_url = "https://scrum-wars.herokuapp.com/assets/thumb/" + purchaseSelection + ".jpg";

                //Create the fields to show
                responseTemplate.attachments[0].fields = [
                    {
                        "title": itemProps.name,
                        "short": false
                    }
                ];

                //Iterate through the object adding to the template
                for (var prop in itemProps) {
                    //console.log(`obj.${prop} = ${itemProps[prop]}`);

                    responseTemplate.attachments[0].fields.push({
                        "title": prop,
                        "value": `${itemProps[prop]}`,
                        "short": true
                    });
                }*/

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

                console.log('Response template: ', JSON.stringify(responseTemplate));
                
                resolve(responseTemplate)
            });
    })
};