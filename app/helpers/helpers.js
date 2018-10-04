"use strict";

const baseURL = 'https://scrum-wars.herokuapp.com/';


const validateSlackResponseFormat = slackResponse => {

    if (!slackResponse) {
        throw new Error('root is undefined')
    }
    
    return slackResponse
};

//Validate expected gameObjects.  For internal use, throws errors if invalid
const validateGameObjects = (gameObjectsToValidate, expectedGameObjects) => {
    if (!Array.isArray(expectedGameObjects)){
        throw new Error('validateGameObjects invoked with argument expectedGameObjects that is not an array');
    }

    //console.log('DEBUG: expectedGameObjects: ', expectedGameObjects);

    expectedGameObjects.forEach( eachExpectedGameObject =>{
        //Verify that gameObject property was passed in
        if (!gameObjectsToValidate[eachExpectedGameObject]){
            throw new Error('missing expected gameObject value: ' + eachExpectedGameObject)
        }
    });

    //******Data type validation*****

    //Data types expected to be strings
    let expectedStrings = [
        'userActionValueSelection',
        'userActionNameSelection',
        'slackCallback'
    ];

    //Data types expected to be strings
    let expectedObjects = [
        'game',
        'user',
        'slackResponseTemplate',
        'playerCharacter',
        'requestZone',
        'currentMatch',
        'characterClass',
        'currentMatch',
        'actionTaken'
    ];

    expectedStrings.forEach( eachExpectedStrings =>{
        if (gameObjectsToValidate[eachExpectedStrings]) {
            if(typeof gameObjectsToValidate[eachExpectedStrings] !== 'string'){
                throw new Error('gameObject expected to be a string and is not!  gameObject: ' + eachExpectedStrings)
            }
        }
    });

    expectedObjects.forEach( eachExpectedObjects =>{
        if (gameObjectsToValidate[eachExpectedObjects]) {
            if(typeof gameObjectsToValidate[eachExpectedObjects] !== 'object'){
                throw new Error('gameObject expected to be an object and is not!  gameObject: ' + eachExpectedObjects)
            }
        }
    });
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
const getFilePaths = (dir, filelist) => {
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

const updateCallback = (attachmentsArray, callbackString) => {

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

