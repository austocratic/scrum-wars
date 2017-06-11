'use strict';

var Firebase = require('../libraries/firebase').Firebase;
var FirebaseController = require('./FirebaseController').FirebaseController;

var firebase = new Firebase();


class Character extends FirebaseController{
    constructor(){
        super();
        console.log('Called Character constructor');
        //this.characterID = characterID
        this.fbType = 'character'
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
    
    moveZone(destinationID, zoneDetails){
        return new Promise((resolve, reject) => {

            //Create a table reference to be used for locating the character
            var tableRef = 'character/' + this.characterID;

            //Define the properties to add to character
            var updates = {
                "zone_id": destinationID
            };

            //Now update the character with new properties
            firebase.update(tableRef, updates)
                .then( () => {
                    resolve();
                });

            //Send slack alert that player was defeated
            var alertDetails = {
                "username": "A mysterious voice",
                "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                "channel": ("#" + zoneDetails.channel),
                "text": this.props.name + " has left " + zoneDetails.name
            };

            //Create a new slack alert object
            var channelAlert = new Slack(alertDetails);

            //Send alert to slack
            channelAlert.sendToSlack(channelAlert.params)
                .then(() =>{
                    console.log('Successfully posted to slack')
                })
                .catch(error =>{
                    console.log('Error when sending to slack: ', error)
                });
        });
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

