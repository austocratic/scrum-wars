'use strict';

//var Firebase = require('../libraries/firebase').Firebase;
//var FirebaseBaseController = require('./FirebaseBaseController').FirebaseBaseController;

//var firebase = new Firebase();

var BaseModel = require('./BaseModel').BaseModel;


class Action extends BaseModel{
    constructor(gameState, actionID){
        super(gameState, 'action', actionID);

        var actions = gameState.action;

        //Set the character's props
        this.props = actions[actionID];
        this.id = actionID
    }
    
 

}





module.exports = {
    Action: Action
};
