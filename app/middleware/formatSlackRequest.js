"use strict";

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

const modifyPayloadForReservedActions = (req) => {
    console.log('Called formatSlackRequest.modifyPayloadForReservedActions()');

    console.log('DEBUG modifyPayloadForReservedActions: req.payload: ', req.payload);

    let userActionValueSelection;

    if (req.payload.actions[0].value) {
        userActionValueSelection = req.payload.actions[0].value
    } else {
        //Action value dictates the specific selection from drop down menus
        userActionValueSelection = req.payload.actions[0].selected_options[0].value;
    }

    //Modify the "name" value depending on what reserved word was selected
    switch(req.payload.actions[0].name){
        case 'back':

            let slackCallbackElements = req.payload.callback_id.split("/");

            let lastKeyValue = slackCallbackElements[slackCallbackElements.length - 3]
                .split(":");

            return lastKeyValue[1];

            req.payload.actions[0].name = lastKeyValue[1];

            //req.payload.actions[0].name = modifyUserActionNameSelection(req.payload.callback_id);

            req.payload.callback_id = modifyCallbackForBack(payload.callback_id);

            break;

        default:

            req.payload.callback_id = `${req.payload.callback_id}:${req.payload.actions[0].name}:${userActionValueSelection}/`;

            break;
    }

    console.log('DEBUG finished modifying for reserved words req.payload.callback_id: ', req.payload.callback_id);
    console.log('DEBUG finished modifying for reserved words req.payload.actions[0].name: ', req.payload.actions[0].name);
};

const modifyCallbackForBack = slackCallback => {
    console.log('called function modifyCallbackForBack');

    //Split up the callback string
    let slackCallbackElements = slackCallback.split("/");

    //console.log('DEBUG modifyCallbackForBack, slackCallbackElements: ', slackCallbackElements);

    //If the callback string is less than 4 elements then it has at most 3 game contexts.
    //In order to go "back" we need to get the context that is 2 elements down.
    if (slackCallbackElements.length < 4) {
        //console.log('DEBUG slackCallbackElements was less than 3');
        return slackCallbackElements[slackCallbackElements.length - 3]
            .split(":")[0];
    }

    //take the last element & split it into context:selection
    let lastKeyValue = slackCallbackElements[slackCallbackElements.length - 3]
        .split(":");

    //remove the last element from the array (the current context)
    slackCallbackElements
        .splice( slackCallbackElements.length - 3, slackCallbackElements.length);

    //console.log('DEBUG slackCallbackElements after splice: ', slackCallbackElements);

    //Remove the value from the key:value
    //lastKeyValue.pop();
    lastKeyValue
        .splice(lastKeyValue.length - 2, 2);

    //console.log('DEBUG lastKeyValue after splice: ', lastKeyValue);

    //If the callback had 3 game contexts, then there will be no slackCallbackElements to join, return the last 1st game context:
    if (slackCallbackElements.join("/").length === 0){
        //console.log('DEBUG passed .length if statement');
        return lastKeyValue[0];
    }

    console.log('DEBUG modifyCallbackForBack, slackCallbackElements: ', slackCallbackElements);
    console.log('DEBUG modifyCallbackForBack, lastKeyValue: ', lastKeyValue);

    //If there are more elements to join (does not hit if above), concatenate
    return slackCallbackElements.join("/") + "/" + lastKeyValue[0];
};


//User selected "back", this changes the click from "back" to whatever was clicked on previous context
/*
const modifyUserActionNameSelection = slackCallback => {
    console.log('called function modifyUserActionNameSelection');

    //Split up the callback string
    let slackCallbackElements = slackCallback.split("/");

    //console.log('DEBUG slackCallbackElements: ', slackCallbackElements);

    let lastKeyValue = slackCallbackElements[slackCallbackElements.length - 3]
        .split(":");

    //console.log('DEBUG lastKeyValue: ', lastKeyValue);

    //Return the last value selected
    return lastKeyValue[1];
};*/



module.exports = {
    formatPayload,
    modifyPayloadForReservedActions
};

