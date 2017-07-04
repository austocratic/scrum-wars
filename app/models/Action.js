'use strict';

//var Firebase = require('../libraries/firebase').Firebase;
//var FirebaseBaseController = require('./FirebaseBaseController').FirebaseBaseController;

//var firebase = new Firebase();

var BaseModel = require('./BaseModel').BaseModel;


class Action extends BaseModel{
    constructor(gameState, actionID){
        super();

        var actions = gameState.action;

        //Set the character's props
        this.props = actions[actionID];
        this.id = actionID

    }
    
    getActionAvailability(turnActionavailable, matchTurn){

   
        //TODO need to reference the turn the player used the action, this is stored in the character


        //If turn one, all actions are available
        if (matchTurn === 1) {
            return true
        } else {
            if (turnActionavailable <= matchTurn) {
            //if (this.props.turn_used + this.props.cool_down <= matchTurn) {
                return true
            } else {
                return false
            }
        }
        
    }

}





/*
class Action extends FirebaseBaseController {
    constructor() {
        super();
        this.firebaseType = 'action'
    }

}*/


module.exports = {
    Action: Action
};
