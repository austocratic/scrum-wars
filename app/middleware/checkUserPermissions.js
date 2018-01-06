"use strict";

const _ = require('lodash');


const checkUserPermissions = (permission, command) => {
    console.log('called Middleware: checkUserPermissions()');

    //If user's permission can not access that slash command, return an error
    return permission.canAccessSlashCommand(command)

};




module.exports = {
    checkUserPermissions
};
