"use strict";

const _ = require('lodash');


const checkUserPermissions = (permission, command) => {
    console.log('called Middleware: checkUserPermissions()');

    //If user's permission can not access that slash command, return an error
    if (!permission.canAccessSlashCommand(command)){
        return {
            "text": "Sorry traveler, but I fear you can't take actions in this land"
        }
    }

};




module.exports = {
    checkUserPermissions
};
