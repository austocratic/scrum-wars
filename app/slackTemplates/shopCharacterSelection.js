
exports.shopCharacterSelection = payload => {

    return {
        "attachments": [
            {
                "text": "_You enter the general store and the merchant greets you warmly_",
                "fallback": "You are unable to choose an action",
                "callback_id": "shopCharacterSelection",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [{
                    "name": "item_list",
                    "text": "Choose an item to purchase",
                    "type": "select",
                    "options": []
                }]
            }
        ]
    };

};