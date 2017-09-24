"use strict";


const modifyCallbackForBack = slackCallback => {
    console.log('called function modifyCallbackForBack');

    //Split up the callback string
    let slackCallbackElements = slackCallback.split("/");

    //If the callback string is short, process differently and return
    if (slackCallbackElements.length < 3) {
        return slackCallbackElements[slackCallbackElements.length - 2]
            .split(":")[0];
    }

    //take the last element & split it into context:selection
    let lastKeyValue = slackCallbackElements[slackCallbackElements.length - 3]
        .split(":");

    //remove the last element from the array (the current context)
    slackCallbackElements
        .splice( slackCallbackElements.length - 3, 3);

    //Remove the value from the key:value
    lastKeyValue.pop();
    
    //If the callback had 3 game contexts, then there will be no slackCallbackElements to join, return the last 1st game context:
    if (slackCallbackElements.join("/").length === 0){
        return lastKeyValue[0];
    }

    //If there are more elements to join (does not hit if above), concatenate
    return slackCallbackElements.join("/") + "/" + lastKeyValue[0];
};

const modifyUserActionNameSelection = slackCallback => {
    console.log('called function modifyUserActionNameSelection');

    //Split up the callback string
    let slackCallbackElements = slackCallback.split("/");

    //take the last element & split it into context:selection
    let lastKeyValue = slackCallbackElements[slackCallbackElements.length - 3]
        .split(":");

    //Return the last value selected
    return lastKeyValue[1];
};

module.exports = {
    modifyCallbackForBack,
    modifyUserActionNameSelection
};
