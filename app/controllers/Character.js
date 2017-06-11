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
        console.log('Called setbyID, this.characterID: ', this.characterID);
        return new Promise((resolve, reject)=>{
            //Get details of the character
            firebase.get('character/' + this.characterID)
                .then(characterDetails => {
                    this.props = characterDetails;
                    resolve()
                });
        })
    }

    //Characters properties need to be set before calling this function.  Use setByProperty() or setByID() first
    resetActions(){
        console.log('called resetActions');

            return new Promise((resolve, reject)=>{

                var turnActionUsedUpdate = {
                    "turn_action_used": 0
                };

                //Reset the character's primary action used property
                firebase.update(('character/' + this.characterID), turnActionUsedUpdate)
                    .then( () => {

                        var singleActionUpdate = {
                            "turn_used": 0
                        };

                        var iterationIndex = 0;

                        console.log('About to iterate actions, props: ', this.props);

                        var characterActionUpdatePromises = this.props.actions.map( singleAction => {

                            console.log('Iterating characters actions, singleAction: ', singleAction);

                            return new Promise((resolve, reject)=>{

                                console.log('Updating character: ', ('character/' + this.characterID + '/actions/' + iterationIndex));

                                firebase.update(('character/' + this.characterID + '/actions/' + iterationIndex), singleActionUpdate)
                                    .then( updateResponse => {
                                        console.log('Updated action: ', ('character/' + this.characterID + '/actions/' + iterationIndex));
                                        console.log('updatedResponse: ', updateResponse);
                                        resolve();
                                    });

                                iterationIndex++;
                            })
                        });

                        Promise.all(characterActionUpdatePromises)
                            .then(()=>{
                                resolve();
                            });
                    })
            })
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

