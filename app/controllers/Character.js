'use strict';

var Firebase = require('../libraries/firebase').Firebase;
var FirebaseBaseController = require('./FirebaseBaseController').FirebaseBaseController;
var Slack = require('../libraries/slack').Alert;

var firebase = new Firebase();


class Character extends FirebaseBaseController{
    constructor(){
        super();
        this.firebaseType = 'character'
    }

    //Characters properties need to be set before calling this function.  Use setByProperty() or setByID() first
    resetActions(){
        console.log('called resetActions');

            return new Promise((resolve, reject)=>{

                var turnActionUsedUpdate = {
                    "turn_action_used": 0
                };

                //Reset the character's primary action used property
                firebase.update(('character/' + this.props.id), turnActionUsedUpdate)
                    .then( () => {

                        var singleActionUpdate = {
                            "turn_used": 0
                        };

                        var iterationIndex = 0;

                        var characterActionUpdatePromises = this.props.actions.map( singleAction => {

                            console.log('resetting actions for character ID: ', this.props.id);
                            
                            return new Promise((resolve, reject)=>{

                                firebase.update(('character/' + this.props.id + '/actions/' + iterationIndex), singleActionUpdate)
                                    .then( updateResponse => {
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

            this.updateProperty("zone_id", destinationID)
                .then(()=>{
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

                    resolve();
                });
        });
    }

    purchaseItem(itemCost){

        return new Promise((resolve, reject)=>{

            //Decrement the player's gold locally
            var playerGold = this.props.gold - itemCost;

            console.log('itemCost: ', itemCost);

            console.log('Gold: ', this.props.gold);

            console.log('Unequipped inventory: ', JSON.stringify(this.props.inventory.unequipped));

            console.log('Character ID: ', this.props.id);

            //Add the purchased item to unequipped inventory array
            this.props.inventory.unequipped.push(this.props.id);

            console.log('Unequipped inventory after update: ', JSON.stringify(this.props.inventory.unequipped));

            //Update the character
            this.updateProperty("gold", playerGold)
            //firebase.update(tableRef, updates)
                .then(()=>{
                    //TODO need to modify the updateProperty to allow multiple updates in one call
                    this.updateProperty("inventory/unequipped", this.props.inventory.unequipped)
                        .then(()=>{
                            resolve()
                        })
                })
        })
    }

    equipItem(itemID){

        //Fetch the details of the itemID. Use this to determine effects
        
        //Add item to equipped list

        //Modify "modified" properties based on item's effects

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

