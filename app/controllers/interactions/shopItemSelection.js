"use strict";
var Firebase = require('../../libraries/firebase').Firebase;
var shopPurchaseConfirm = require('../../slackTemplates/shopPurchaseConfirm').shopPurchaseConfirm;

exports.shopItemSelection = payload => {

    console.log('shopItemSelection called')

    var firebase = new Firebase();

    var responseTemplate = shopPurchaseConfirm();

    return new Promise((resolve, reject) => {

        //get the value of the item selected
        var purchaseSelection = payload.actions[0].value;

        //Use previous selection ID to lookup the item properties
        firebase.get(('item/' + purchaseSelection))
            .then( itemProps => {

                console.log('ItemProps', itemProps);

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
                    })

                    console.log('responseTemplate.attachments[0].fields: ', JSON.stringify(responseTemplate.attachments[0].fields))
                }

                console.log('Response template: ', JSON.stringify(responseTemplate));
                
                resolve(responseTemplate)
            });
    })
};