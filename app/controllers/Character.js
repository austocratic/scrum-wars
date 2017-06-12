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

    purchaseItem(purchasedItem){

        return new Promise((resolve, reject)=>{

            //Decrement the player's gold locally
            var playerGold = this.props.gold - purchasedItem.props.cost;

            //Add the purchased item to unequipped inventory array
            this.props.inventory.unequipped.push(purchasedItem.props.id);

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

    equipItem(equippedItem){
        
        //Add item to equipped array
        this.props.inventory.equipped.push(equippedItem.props.id);

        //Remove item from unequipped list
        var index = this.props.inventory.unequipped.indexOf(equippedItem.props.id);

        //Remove that array element
        if (index > -1) {
            this.props.inventory.unequipped.splice(index, 1);
        }

        //Look at item's "effects" object and set an array of those keys
        var effectsKeys = Object.keys(equippedItem.props.effects);

        //Iterate through the keys array
        var characterUpdatePromises = effectsKeys.map(effectKey=>{

            return new Promise((resolve, reject)=>{
                var effectValue = equippedItem.props.effects[effectKey];

                var newValue = this.props[effectKey] + effectValue;

                this.updateProperty(effectKey, newValue)
                    .then(()=>{
                        resolve()
                    })
            })
        });

        //Create a promise for updating unequipped inventory
        characterUpdatePromises.push(this.updateProperty("inventory/unequipped", this.props.inventory.unequipped));

        //Create a promise for updating equipped inventory
        characterUpdatePromises.push(this.updateProperty("inventory/equipped", this.props.inventory.equipped));

        //When all character property updates are done, resolve equipItem
        Promise.all(characterUpdatePromises)
            .then(()=>{
                resolve();
            });


        /*
        //TODO need to modify the updateProperty to allow multiple updates in one call
        this.updateProperty("inventory/unequipped", this.props.inventory.unequipped)
            .then(()=>{
                this.updateProperty("inventory/equipped", this.props.inventory.equipped)
                    .then(()=> {
                        resolve()
                    });
            });*/

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

