exports.shopPurchaseConfirm = payload => {

    return {
        "attachments": [
            {
                "text": "What do you think of it? Would you like to purchase?",
                "fallback": "You are unable to choose an action",
                "callback_id": "shopPurchaseConfirm",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "fields": [
             
                ],
                "actions": [
                    {
                        "name": "purchaseConfirm",
                        "text": "Yes, I'll take it",
                        "type": "button",
                        "value": "yes"
                    },
                    {
                        "name": "purchaseConfirm",
                        "text": "No thanks, I'll keep browsing",
                        "type": "button",
                        "value": "no"
                    }

                ]
            }
        ]
    };

};
