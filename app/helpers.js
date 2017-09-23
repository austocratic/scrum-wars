"use strict";

const baseURL = 'https://scrum-wars.herokuapp.com/';



//TODO get Dannys advice
const validateSlackResponseFormat = slackResponse => {

    if (!slackResponse) {
        throw new Error('root is undefined')
    }
    
    return slackResponse

};

//Validate expected gameObjects
const validateGameObjects = (gameObjectsToValidate, expectedGameObjects) => {
    if (!Array.isArray(expectedGameObjects)){
        throw new Error('validateGameObjects invoked with argument expectedGameObjects that is not an array');
    }

    expectedGameObjects.forEach( eachExpectedGameObject =>{
        if (!gameObjectsToValidate[eachExpectedGameObject]){
            throw new Error('missing expected gameObject: ' + eachExpectedGameObject)
        }
    })
};

var getImageFilePaths = (dir, filelist) => {

    console.log('called getImageFilePaths(), filelist: ', filelist);

    getFilePaths(dir, filelist);

    return filelist.map( eachFilePath =>{
        return baseURL + eachFilePath
    })
};

//Populates an array of file path references based on dir parameter
//Mutates the passed fileList array parameter, also returns it
var getFilePaths = (dir, filelist) => {
    var path = path || require('path');
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach( file => {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = getFilePaths(path.join(dir, file), filelist);
        }
        else {
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
};

var updateCallback = (attachmentsArray, callbackString) => {

    //Check if attachmentsArray is empty.  If it is, create a single attachment
    /*
     if (attachmentsArray.length === 0){
     attachmentsArray.push()
     }*/

    return attachmentsArray.map( eachAttachment =>{
        eachAttachment.callback_id = callbackString;

        return eachAttachment
    })
};

module.exports = {
    getImageFilePaths,
    getFilePaths,
    updateCallback,
    validateSlackResponseFormat,
    validateGameObjects
};

