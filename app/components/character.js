'use strict';

var Firebase = require('../libraries/firebase').Firebase;

var firebase = new Firebase();

/*
class Character{
    constructor(){}

    setByProperty(characterProperty, lookupID){
        //Use Slack user ID to lookup the user's character
        firebase.get('character', characterProperty, lookupID)
            .then( character => {

                //Convert the returned object into array of character IDs.  This works since the query only returns one result
                var characterID = Object.keys(character)[0];

                var characterStats = character[characterID];

                //TODO see if this works
                Object.assign(this, characterStats)

            })
    }

    /*
    setByID(){
        //Get details of the winning character
        firebase.get('character/' + this.id)
            .then(characterDetails => {
                //TODO see if this works
                Object.assign(this, characterDetails)
            });
    }*/

    /*
    resetHealth(){
        return new Promise((resolve, reject)=>{
            firebase.update(('character/' + characterID + '/actions/' + iterationIndex), singleActionUpdate)
                .then( updateResponse => {
                    console.log('Updated action: ', ('character/' + characterID + '/actions/' + iterationIndex));
                    console.log('updatedResponse: ', updateResponse);
                    iterationIndex++;
                    resolve();
                });
        })
    }*/

//}


/*
module.exports = {
    Character: Character
};*/

//more changes

exports.testFunctionCharacter = () => {
    
};