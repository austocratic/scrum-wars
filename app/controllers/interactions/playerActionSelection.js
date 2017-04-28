"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var attackCharacterSelection = require('../../slackTemplates/attackCharacterSelection').attackCharacterSelection;

exports.playerActionSelection = payload => {

    console.log('Called playerActionSelection');

    return new Promise((resolve, reject) => {

        //TODO likely need to add get current user zone here to compare it to actual zone the command was called in

        console.log('Action value: ', payload.actions[0].value);

        switch(payload.actions[0].value) {
            
            case 'attack':

                //Return the default template
                var template = attackCharacterSelection();

                var firebase = new Firebase();

                //Get the slack user ID who called the action
                var userID = payload.user.id;

                console.log('userID: ', userID);

                //Get that user's character
                firebase.get('character', 'user_id', userID)
                    .then( character => {

                        console.log('user character:' , character);

                        //Character's ID
                        var characterID = Object.keys(character)[0];

                        console.log('Character ID: ', characterID);

                        //Get the Zone ID of that character
                        var characterZoneID = character[characterID].zone_id;

                        console.log('Character zone: ', characterZoneID);

                            //Get an array of all players in that zone
                            firebase.get('character', 'zone_id', characterZoneID)
                                .then(charactersInZone => {

                                    console.log('Characters in zone: ', charactersInZone);

                                    //Get an array of all character IDs in the zone
                                    var charactersInZoneIDs = Object.keys(charactersInZone);
                                    
                                    console.log('Characters in zone IDs: ', charactersInZoneIDs);

                                    var namesInZone = charactersInZoneIDs.map( charID =>{

                                        return charactersInZone[charID].name;

                                    });

                                    console.log('Names in zone: ', namesInZone);

                                    var playerTemplate = namesInZone.map( playerName =>{

                                        return {
                                            "name": "playerName",
                                            "text": playerName,
                                            "style": "default",
                                            "type": "button",
                                            "value": playerName
                                        }
                                    });

                                    console.log('Playertemplate: ', playerTemplate);

                                    template.attachments[0].actions = playerTemplate;

                                    console.log('Final Template: ', template);

                                    resolve(template);

                                })
                    });
                
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