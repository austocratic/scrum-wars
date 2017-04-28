"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var attackCharacterComplete = require('../../slackTemplates/attackCharacterComplete').attackCharacterComplete;

exports.playerAttack = payload => {

    return new Promise((resolve, reject) => {
        
        //Get the name of the player to attack
        //TODO I currently populate the attack targets with player names.  I could populate names but populate targets with IDs
        var targetPlayer = payload.actions[0].value;
        
        console.log('Target player: ', targetPlayer);

        //Return the default template
        var template = attackCharacterComplete();

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
                
                var characterStrength = character[characterID].strength;

                //TODO need to move this function somewhere else
                function getRandomIntInclusive(min, max) {
                    min = Math.ceil(min);
                    max = Math.floor(max);
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }

                //TODO for phase 1 simplicity: damage will be a random # up to strength value
                //Generate a random number based on character strength
                var randomDamage = getRandomIntInclusive(1, characterStrength);

                console.log('Random damage: ', randomDamage);
                
                //Get the ID of the target character:
                //TODO I could use promise.all to do this lookup with the user's character lookup
                firebase.get('character', 'name', targetPlayer)
                    .then( target => {

                        //Target character's ID
                        var targetCharacterID = Object.keys(target)[0];
                        
                        //Target's current health
                        var targetHealth = target[targetCharacterID].health;
                        
                        var newHealth = (targetHealth - randomDamage);

                        //Create a table reference to be used for locating the character
                        var tableRef = 'character/' + targetCharacterID;

                        //Define the properties to add to character
                        var updates = {
                            "health": newHealth
                        };

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
