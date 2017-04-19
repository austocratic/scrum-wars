"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var attackMenu = require('../../slackTemplates/attackMenu').attackMenu;

exports.playerActionSelection = payload => {

    return new Promise((resolve, reject) => {

        //TODO likely need to add get current user zone here to compare it to actual zone the command was called in



        switch(payload.actions[0].value) {
            
            case 'attack':

                //Return the default template
                var template = attackMenu();

                var firebase = new Firebase();

                //Get the slack user ID who called the action
                var userID = payload.user_id;

                //Get that player's current zone
                firebase.get('character', 'zone_id', userID)
                    .then( playerCurrentZone => {

                        //Convert the returned object into array of zone IDs.  This works since the query only returns one result
                        var playerCurrentZoneID = Object.keys(playerCurrentZone)[0];

                        //Get an array of all players in that zone
                        firebase.get('character', 'zone_id', playerCurrentZoneID)
                            .then( character => {

                                


                            })



                    })



                
                
                
                var playerTemplate = {
                    "actions": [
                        {
                            "name": "shop",
                            "text": "Shop",
                            "style": "default",
                            "type": "button",
                            "value": "shop"
                        }
                    ]
                };
                
                resolve(
                    {
                        "text": "You attack an enemy"
                    }
                );
                
                break;
            
            case 'defend':

                resolve(
                    {
                        "text": "You raise your shield to defend yourself"
                    }
                );
                
                break;
            
            case 'shop':

                resolve(
                    {
                        "text": "You enter the shop.  The merchant smiles happily"
                    }
                );
                
                break;
            
            default:
                
                resolve(
                    {
                        "text": "That action is not supported"
                    }
                );
            
            
        }
        
        

    });

}