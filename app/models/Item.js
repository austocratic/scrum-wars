'use strict';

var Firebase = require('../libraries/firebase').Firebase;
var FirebaseBaseController = require('./FirebaseBaseController').FirebaseBaseController;

var firebase = new Firebase();


class Item extends FirebaseBaseController {
    constructor() {
        super();
        this.firebaseType = 'item'
    }
    
}


module.exports = {
    Item: Item
};
