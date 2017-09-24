"use strict";


const modifyCallbackForBack = slackCallback => {
    console.log('called function modifyCallbackForBack');

    //Split up the callback string
    let slackCallbackElements = slackCallback.split("/");

    console.log('DEBUG slackCallbackElements = ', slackCallbackElements);

    console.log('DEBUG slackCallbackElements.length = ', slackCallbackElements.length);

    //If the callback string is short, process differently and return
    if (slackCallbackElements.length <= 3) {
        return slackCallbackElements[slackCallbackElements.length - 2]
            .split(":")[0];
    }

    //take the last element & split it into context:selection
    let lastKeyValue = slackCallbackElements[slackCallbackElements.length - 3]
        .split(":");

    console.log('DEBUG slackCallbackElements: ', slackCallbackElements);

    //remove the last element from the array (the current context)
    slackCallbackElements
        .splice( slackCallbackElements.length - 3, 3);

    //Remove the value from the key:value
    lastKeyValue.pop();

    //Assemble the string again & return
    return slackCallbackElements.join("/") + "/" + lastKeyValue[0];
};

const modifyUserActionNameSelection = slackCallback => {
    console.log('called function modifyUserActionNameSelection');

    //Split up the callback string
    let slackCallbackElements = slackCallback.split("/");

    //take the last element & split it into context:selection
    let lastKeyValue = slackCallbackElements[slackCallbackElements.length - 3]
        .split(":");

    console.log('DEBUG lastKeyValue: ', lastKeyValue);

    //Return the last value selected
    return lastKeyValue[1];
};


module.exports = {
    modifyCallbackForBack,
    modifyUserActionNameSelection
};
