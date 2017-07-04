'use strict';

//var Firebase = require('../libraries/firebase').Firebase;
//var FirebaseBaseController = require('./FirebaseBaseController').FirebaseBaseController;

//var firebase = new Firebase();


var BaseModel = require('./BaseModel').BaseModel;


class Item extends BaseModel {
    constructor(gameState, itemID) {
        super();

        var items = gameState.item;

        //Set the character's props
        this.props = items[itemID];
        this.id = itemID
    }

    getDetailView(){

        console.log('Item props: ', this.props);

            var template = {
                "attachments": [
                    {

                    }
                ]
            };

            template.attachments[0].thumb_url = "https://scrum-wars.herokuapp.com/assets/thumb/" + this.id + ".jpg";

            //Create the fields to show
            template.attachments[0].fields = [
                {
                    "title": this.props.name,
                    "short": false
                }
            ];

            //Iterate through the object adding to the template
            for (var prop in this.props) {
                //console.log(`obj.${prop} = ${itemProps[prop]}`);

                template.attachments[0].fields.push({
                    "title": prop,
                    "value": `${this.props[prop]}`,
                    "short": true
                });
            }

            return template;

        };

}

/*
class Item extends FirebaseBaseController {
    constructor() {
        super();
        this.firebaseType = 'item'
    }
    
}*/


module.exports = {
    Item: Item
};
