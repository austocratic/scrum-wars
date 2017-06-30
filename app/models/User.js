'use strict';

var _ = require('lodash');
var BaseModel = require('./BaseModel').BaseModel;
//var Item = require('./Item').Item;



class User extends BaseModel{
    constructor(gameState, slackUserID){
        super();

        //Look at game state and fine the user who's slackUser was passed in:
        var users = gameState.user;
        
        var localID = _.findKey(users, {'slack_user_id': slackUserID});
        
        //Set the character's props
        this.props = users[localID];
        this.id = localID
    }

    //Currently limited to one character per user. Return that player's character ID
    getCharacterID(){
        return this.props.character_id;
    }

}


module.exports = {
    User: User
};
