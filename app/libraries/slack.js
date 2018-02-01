"use strict";

// ---Modules---
const request = require('request');

if(process.env.USE_LOCAL_ENV) {
    require('dotenv').load();
}

const slackHook = process.env.SLACK_HOOK;


//New Slack functionality.  To replace class hierarchy below
const sendMessage = payloadBody => {

    let requestOptions = {
        uri:                     process.env.SLACK_HOOK,
        resolveWithFullResponse: true,
        json:                    true,
        body:                    payloadBody
    };

    request.post(requestOptions, (err, httpResponse, body) => {
        if (err) {
            console.log('ERROR when sending message to slack: ' + err);
            return err
        }
    });
    
};


class Slack {
    constructor() {}

    //TODO: need to add validation to ensure that this.options are set before calling
    sendToSlack(){

        request.post(this.options, (err, httpResponse, body) => {
            if (err) {
                console.log('ERROR when sending message to slack: ' + err);
            }
        });
    }
}

class Alert extends Slack {
    constructor(params) {
        super();

        this.params = params;

        //Set options in format for passing to Slack
        this._setOptions();
    }

    _setOptions() {

        this.options = {
            uri:                     slackHook,
            resolveWithFullResponse: true,
            json:                    true,
            body:                    this.params
        };
    }
}

module.exports = {
    Alert,
    sendMessage
};
