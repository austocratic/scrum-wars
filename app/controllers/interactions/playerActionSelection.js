"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var attackCharacterSelection = require('../../slackTemplates/attackCharacterSelection').attackCharacterSelection;

exports.playerActionSelection = payload => {

    return new Promise((resolve, reject) => {

        //TODO likely need to add get current user zone here to compare it to actual zone the command was called in

        switch(payload.actions[0].value) {
            
            case 'attack':

                //Return the default template
                var template = attackCharacterSelection();

                var firebase = new Firebase();

                //Get the slack user ID who called the action
                var userID = payload.user.id;

                //Get that user's character
                firebase.get('character', 'user_id', userID)
                    .then( character => {

                        //Character's ID
                        var characterID = Object.keys(character)[0];

                        //Get the Zone ID of that character
                        var characterZoneID = character[characterID].zone_id;

                            //Get an array of all players in that zone
                            firebase.get('character', 'zone_id', characterZoneID)
                                .then(charactersInZone => {
                                    
                                    //Get an array of all character IDs in the zone
                                    var charactersInZoneIDs = Object.keys(charactersInZone);

                                    //Get the array position of the player's character:
                                    var playerCharacterArrayPosition = charactersInZoneIDs.indexOf(characterID);

                                    console.log('Player character position: ', playerCharacterArrayPosition);

                                    if (playerCharacterArrayPosition > -1) {
                                        charactersInZoneIDs = charactersInZoneIDs.splice(playerCharacterArrayPosition, 1);
                                    }

                                    var namesInZone = charactersInZoneIDs.map( charID =>{
                                        return charactersInZone[charID].name;
                                    });

                                    var playerTemplate = namesInZone.map( playerName =>{

                                        return {
                                            "name": "playerName",
                                            "text": playerName,
                                            "style": "default",
                                            "type": "button",
                                            "value": playerName
                                        }
                                    });

                                    template.attachments[0].actions = playerTemplate;

                                    resolve(template);

                                })
                    });
                
                break;
            
            case 'defend':

                //Return the default template
                var template = attackCharacterSelection();

                var firebase = new Firebase();

                //Get the slack user ID who called the action
                var userID = payload.user.id;

                //Get that user's character
                firebase.get('character', 'user_id', userID)
                    .then( character => {

                        //Character's ID
                        var characterID = Object.keys(character)[0];

                        //Get the Zone ID of that character
                        var characterZoneID = character[characterID].zone_id;


                        //Set that character's is_defending property to true

                            resolve(template);


                    });
                
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