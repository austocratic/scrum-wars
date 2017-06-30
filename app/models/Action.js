'use strict';

var Firebase = require('../libraries/firebase').Firebase;
var FirebaseBaseController = require('./FirebaseBaseController').FirebaseBaseController;

var firebase = new Firebase();


class Action extends FirebaseBaseController {
    constructor() {
        super();
        this.firebaseType = 'action'
    }

}


module.exports = {
    Action: Action
};
