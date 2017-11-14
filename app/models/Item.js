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
                    //"image_url": "https://scrum-wars.herokuapp.com/public/images/fullSize/" + this.id + ".jpg",
                    "image_url": `https://scrum-wars.herokuapp.com/public/images/${this.props.icon_name}.png`,
                    "fallback": "You can't select this item",
                    "fields": [
                        {
                            "title": this.props.name,
                            "short": false
                        }
                    ]
                }
            ]
        };

        //Iterate through the object adding properties to the template
        for (let prop in this.props) {

            template.attachments[0].fields.push({
                "title": prop,
                "value": `${this.props[prop]}`,
                "short": true
            });
        }
        return template;
    };
}



module.exports = {
    Item
};
