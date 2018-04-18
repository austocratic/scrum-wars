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

    /*
    getActionText(playerCharacter){

        //If the action is a basic melee attack, name should be dynamic based on the character's weapon
        if (this.props.functionName === "BasicMelee"){

        }

        return this.props.name
    }*/
 

}





module.exports = {
    Action
};
