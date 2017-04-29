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

                        //If target is defending, they will take no damage, instead remove is_defending
                        if (targetDefending) {

                            updates = {
                                "is_defending": false
                            };

                            //Change template to reflect that the target defended
                            template.attachments[0].text = "You attack but the target was defending, attack is blocked!";


                        } else {

                            //TODO for phase 1 simplicity: damage will be a random # up to strength value
                            //Generate a random number based on character strength
                            var randomDamage = getRandomIntInclusive(1, characterStrength);

                            console.log('randomDamage: ', randomDamage);

                            console.log('target: ', target);

                            console.log('targetCharacterID: ', targetCharacterID);

                            //Target's current health
                            var targetHealth = target[targetCharacterID].hit_points;

                            console.log('targetHealth: ', targetHealth);

                            var newHealth = (targetHealth - randomDamage);

                            console.log('New health: ', newHealth);

                            //Define the properties to add to character
                            updates = {
                                "hit_points": newHealth
                            };

                            template.attachments[0].text = "You attack and score a crushing blow!";

                        }
                        
                        //Create a table reference to be used for locating the character
                        var tableRef = 'character/' + targetCharacterID;

                        console.log('Updates: ', updates);

                        //Reduce target's health
                        firebase.update(tableRef, updates)
                            .then( ()=> {
                                //Then return the new template
                                resolve(template)
                            })
                        
                    
                    })
                
            })
        
    })


};
