'use strict';


const BaseModel = require('./BaseModel').BaseModel;


class Item extends BaseModel {
    constructor(gameState, itemID) {
        super(gameState, 'item', itemID);

        let items = gameState.item;

        //Set the character's props
        this.props = items[itemID];
        this.id = itemID
    }

    getDetailView(){

        //TODO not good to hardcode the url path here.  Elsewhere I use the game.baseURL property, but Item does not have access to game (ony game.state)
        let template = {
            "attachments": [
                {
                    "fallback": "You can't select this item",
                    "image_url": `https://scrum-wars.herokuapp.com/public/images/${this.props.icon_name}.png`,
                    "color": "#000000"
                },
                {
                    "color": "#000000",
                    "fallback": "You can't select this item",
                    "title": "Item stats",
                    "fields": [
                        {
                            "title": "Value",
                            "value": this.props.cost,
                            "short": false
                        }
                    ]
                },
                {
                    "color": "#000000",
                    "fallback": "You can't select this item",
                    "title": "Item modifiers",
                    "fields": []
                }

            ]
        };

        //Show all the item's modifiers:
        for (let prop in this.props.modifiers) {

            template.attachments[2].fields.push({
                "title": prop,
                "value": `${this.props.modifiers[prop]}`,
                "short": true
            });
        }
        return template;
    };
}



module.exports = {
    Item
};
