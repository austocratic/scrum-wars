"use strict";

// ---Modules---
const request = require('request');

const slackHook = process.env.SLACK_HOOK;


class Slack {
    constructor() {
    }

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

        console.log('setting uri: ', process.env.SLACK_HOOK);

        this.options = {
            uri:                     slackHook,
            resolveWithFullResponse: true,
            json:                    true,
            body:                    this.params
        };

        console.log('slack parameters: ', this.options)
    }
}

module.exports = {
    Alert
};
