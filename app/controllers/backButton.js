"use strict";


const backButton = slackCallback => {
    console.log('called function backButton');

    //Split up the callback string
    let slackCallbackElements = slackCallback.split("/");

    //If the callback string is short, process differently and return
    if (slackCallbackElements.length <= 2) {
        return slackCallbackElements[slackCallbackElements.length - 2]
            .split(":")[0];
    }

    //take the last element & split it into context:selection
    let lastKeyValue = slackCallbackElements[slackCallbackElements.length - 2]
        .split(":");

    //remove the last element from the array (the current context)
    slackCallbackElements
        .splice( slackCallbackElements.length - 2, 2);

    //Remove the value from the key:value
    lastKeyValue.pop();

    //Assemble the string again & return
    return slackCallbackElements.join("/") + "/" + lastKeyValue[0];
};


module.exports = {
    backButton
};
