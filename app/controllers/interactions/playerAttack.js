"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var attackCharacterComplete = require('../../slackTemplates/attackCharacterComplete').attackCharacterComplete;

exports.playerAttack = payload => {

    return new Promise((resolve, reject) => {
        
        //Get the name of the player to attack
        //TODO I currently populate the attack targets with player names.  I could populate names but populate targets with IDs
        var targetPlayer = payload.actions[0].value;

        //Return the default template
        var template = attackCharacterComplete();

        var firebase = new Firebase();

        //Get the slack user ID who called the action
        var userID = payload.user.id;
        
        //Get that user's character
        firebase.get('character', 'user_id', userID)
            .then( character => {

                //Character's ID
                var characterID = Object.keys(character)[0];
                
                var characterStrength = character[characterID].strength;

                //TODO need to move this function somewhere else
                function getRandomIntInclusive(min, max) {
                    min = Math.ceil(min);
                    max = Math.floor(max);
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }

                
                //Get the ID of the target character:
                //TODO I could use promise.all to do this lookup with the user's character lookup
                firebase.get('character', 'name', targetPlayer)
                    .then( target => {

                        //Target character's ID
                        var targetCharacterID = Object.keys(target)[0];

                        console.log('Target character: ', target[targetCharacterID]);
                        
                        //Determine if the target is defending
                        var targetDefending = target[targetCharacterID].is_defending;

                        var updates;

                        //Get the attacking player's character name
                        var attackerName = character[characterID].name;

                        //Get the defending player's character name
                        var defenderName = target[targetCharacterID].name;

                        //If target is defending, they will take no damage, instead remove is_defending
                        if (targetDefending) {

                            updates = {
                                "is_defending": false
                            };

                            //Set the response template to display to all players in channel
                            template.response_type = "in_channel";

                            //Change template to reflect that the target defended
                            template.text = (attackerName + " moves in with a fierce strike, however " + defenderName + " blocks the attack!");
                            //template.attachments[0].text = (attackerName + " moves in with a fierce strike, however " + defenderName + " blocks the attack!");

                        } else {

                            //TODO for phase 1 simplicity: damage will be a random # up to strength value
                            //Generate a random number based on character strength
                            var randomDamage = getRandomIntInclusive(1, characterStrength);

                            //Target's current health
                            var targetHealth = target[targetCharacterID].hit_points;

                            var newHealth = (targetHealth - randomDamage);

                            //Define the properties to add to character
                            updates = {
                                "hit_points": newHealth
                            };

                            //Set the response template to display to all players in channel
                            template.response_type = "in_channel";

                            template.text = (attackerName + " lunges forward with a powerful strike and lands a crushing blow on " + defenderName + " for " + randomDamage + " points of damage!");
                            //template.attachments[0].text = (attackerName + " lunges forward with a powerful strike and lands a crushing blow on " + defenderName + " for " + randomDamage + " points of damage!");

                        }
                        
                        //Create a table reference to be used for locating the character
                        var tableRef = 'character/' + targetCharacterID;

                        console.log('Updates: ', updates);
                        
                        console.log('Final attack template: ', template);

                        //Change target attributes
                        firebase.update(tableRef, updates)
                            .then( ()=> {
                                //Then return the new template
                                resolve(template)
                            })
                        
                    
                    })
                
            })
        
    })


};
