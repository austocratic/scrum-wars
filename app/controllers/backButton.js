"use strict";

const getInteractiveMessageResponse = require('./slackRequest').getInteractiveMessageResponse;


const modifyCallbackForBack = slackCallback => {
    console.log('called function modifyCallbackForBack');

    //Split up the callback string
    let slackCallbackElements = slackCallback.split("/");

    console.log('DEBUG modifyCallbackForBack, slackCallbackElements: ', slackCallbackElements);

    //If the callback string is less than 4 elements then it has at most 3 game contexts.
    //In order to go "back" we need to get the context that is 2 elements down.
    if (slackCallbackElements.length < 4) {
        console.log('DEBUG slackCallbackElements was less than 3');
        return slackCallbackElements[slackCallbackElements.length - 3]
            .split(":")[0];
    }

    //take the last element & split it into context:selection
    let lastKeyValue = slackCallbackElements[slackCallbackElements.length - 3]
        .split(":");

    //remove the last element from the array (the current context)
    slackCallbackElements
        .splice( slackCallbackElements.length - 3, slackCallbackElements.length);

    console.log('DEBUG slackCallbackElements after splice: ', slackCallbackElements);

    //Remove the value from the key:value
    //lastKeyValue.pop();
    lastKeyValue
        .splice(lastKeyValue.length - 2, 2);

    console.log('DEBUG lastKeyValue after splice: ', lastKeyValue);
    
    //If the callback had 3 game contexts, then there will be no slackCallbackElements to join, return the last 1st game context:
    if (slackCallbackElements.join("/").length === 0){
        console.log('DEBUG passed .length if statement')
        return lastKeyValue[0];
    }

    console.log('DEBUG modifyCallbackForBack, slackCallbackElements: ', slackCallbackElements);
    console.log('DEBUG modifyCallbackForBack, lastKeyValue: ', lastKeyValue);

    //If there are more elements to join (does not hit if above), concatenate
    return slackCallbackElements.join("/") + "/" + lastKeyValue[0];
};


//User selected "back", this changes the click from "back" to whatever was clicked on previous context
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
};


//TESTING
const processBackButton = gameObjects =>{

    //Modify the callback and the user selection

    //Make a request to slackController, passing in the modified callback and user selection
    console.log('processBackButton - slackCallback: ', gameObjects.slackCallback);

    //TODO these are pulled from gameObjects, I will need to modify the gameObjects.payload in order to route the request back
    console.log('processBackButton - payload: ', gameObjects.payload);
    console.log('processBackButton - userActionValueSelection: ', gameObjects.userActionValueSelection);
    console.log('processBackButton - userActionNameSelection: ', gameObjects.userActionNameSelection);


    //Recreate the payload to pass in:
    //payload.actions[0].name;
    //payload.actions[0].value
    //OR
    //payload.actions[0].selected_options[0].value;
    //payload.callback_id.split("/");
    //payload.user.id
    //payload.channel.id
    //payload.command

    //payload, game
    return getInteractiveMessageResponse(gameObjects.payload, gameObjects.game)



    //Normal flow:
    //slackRequest/processInteractiveMessage
    //slackRequest/beginRequest
    //slackRequest/getInteractiveMessageResponse
    //slackRequest/getInteractiveMessageResponse/processRequest -> routes the request to a function based on mapping
    //slackRequest/endRequest --> only updates state of game, may not be necessary when clicking back
};

module.exports = {
    modifyCallbackForBack,
    modifyUserActionNameSelection,
    processBackButton
};
