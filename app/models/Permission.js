'use strict';

const BaseModel = require('./BaseModel').BaseModel;

const _ = require('lodash');

class Permission extends BaseModel {
    constructor(gameState, permissionID) {
        super(gameState, 'permission', permissionID);

        let permissions = gameState.permission;

        //Set the character's props
        this.props = permissions[permissionID];
        this.id = permissionID
    }

    //Pass in a slash command argument as a string, verify that this permission can access it
    //Return true/false
    canAccessSlashCommand(commandToAccess){

        let foundCommand = this.props.available_commands.find( eachAvailableCommand =>{
            return eachAvailableCommand === commandToAccess
        });



        return foundCommand;

    }


}

module.exports = {
    Permission
};

