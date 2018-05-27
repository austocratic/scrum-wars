'use strict';


const BaseModel = require('./BaseModel').BaseModel;


class Action extends BaseModel{
    constructor(gameState, actionID){
        super(gameState, 'action', actionID);

        let actions = gameState.action;

        //Set the character's props
        this.props = actions[actionID];
        this.id = actionID
    }
}





module.exports = {
    Action
};
