'use strict';

var Firebase = require('../libraries/firebase').Firebase;

var firebase = new Firebase();


class Character{
    constructor(characterID){
        this.characterID = characterID
    }

    setByProperty(characterProperty, lookupID){
        
        console.log('Called setByProperty: ', characterProperty);
        console.log('Called lookupID: ', lookupID);
        return new Promise((resolve, reject)=> {
            //Use Slack user ID to lookup the user's character
            firebase.get('character', characterProperty, lookupID)
                .then(character => {

                    //Convert the returned object into array of character IDs.  This works since the query only returns one result
                    var characterID = Object.keys(character)[0];

                    this.props = character[characterID];

                    resolve();

                })
        });
    }
    
    setByID(){
        //Get details of the character
        firebase.get('character/' + this.characterID)
            .then(characterDetails => {
                this.props = characterDetails;
            });
    }

    //Characters properties need to be set before calling this function.  Use setByProperty() or setByID() first
    resetActions(){

        //TODO pull out the reset character's actions functionality into a stand alone actions class
        //Iterate through characterID array resetting turn_action_used
        //var characterUpdatePromises = characterIDs.map( characterID =>{

            return new Promise((resolve, reject)=>{

                var turnActionUsedUpdate = {
                    "turn_action_used": 0
                };

                //Reset the character's primary action used property
                firebase.update(('character/' + this.characterID), turnActionUsedUpdate)
                    .then( () => {

                        //Next get that player's actions.  These need to be reset
                        //var characterActions = allCharacters[this.characterID].actions;

                        //console.log('characterActions: ', JSON.stringify(characterActions));

                        var singleActionUpdate = {
                            "turn_used": 0
                        };

                        var iterationIndex = 0;

                        console.log('About to iterate characters actions: ', this.characterID);

                        var characterActionUpdatePromises = this.props.actions.map( singleAction => {

                            console.log('Iterating characters actions, singleAction: ', singleAction);

                            //TODO for some reason this is not updating every action even though log shows it getting updated
                            //Maybe the way that array values are returned (end up in a different order, so certain actions are getting updated twice

                            return new Promise((resolve, reject)=>{
                                firebase.update(('character/' + this.characterID + '/actions/' + iterationIndex), singleActionUpdate)
                                    .then( updateResponse => {
                                        console.log('Updated action: ', ('character/' + this.characterID + '/actions/' + iterationIndex));
                                        console.log('updatedResponse: ', updateResponse);
                                        iterationIndex++;
                                        resolve();
                                    });
                            })
                        });

                        Promise.all(characterActionUpdatePromises)
                            .then(()=>{
                                resolve();
                            });
                    })
            })
        //});

        //After all characters have been updated
        /*
        Promise.all(characterUpdatePromises)
            .then(()=>{
                resolve();
            })*/
        
    }



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
}


module.exports = {
    Character: Character
};

