"use strict";

// ---Modules---
var request = require('request');

var slackHook = process.env.SLACK_HOOK;


class Slack {
    constructor() {
    }

    //TODO: need to add validation to ensure that this.options are set before calling
    sendToSlack(params){

        return new Promise( (resolve, reject) => {
            request.post(params, (err, httpResponse, body) => {
                if (err) {
                    reject(err);
                }
                resolve(body);
            })
        })
    }
}

class Alert extends Slack {
    constructor(params)
    
    {
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
        }
    }
}

module.exports = {
    Alert: Alert
};
