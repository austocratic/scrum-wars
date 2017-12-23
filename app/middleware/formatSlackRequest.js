"use strict";


const _ = require('lodash');

const formatPayload = (req) => {
    console.log('Called formatSlackRequest.formatPayload()');

    let payload;

    function tryToParseJSON(input){
        try {
            return JSON.parse(input);
        } catch(err){
            return input
        }
    }

    if (tryToParseJSON(req.body.payload)){
        payload = tryToParseJSON(req.body.payload)
    } else {
        payload = tryToParseJSON(req.body)
    }

    return payload;

};

module.exports = {
    formatPayload
};

