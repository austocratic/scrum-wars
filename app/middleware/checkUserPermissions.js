"use strict";

const _ = require('lodash');


const checkUserPermissions = (req) => {
    console.log('called Middleware: checkUserPermissions()');

    //If user's permission can not access that slash command, return an error
    if (!req.gameObjects.permission.canAccessSlashCommand(req.gameObjects.command)){
        return {
            "text": "Sorry traveler, but I fear you can't take actions in this land"
        }
    }

};




module.exports = {
    checkUserPermissions
};
