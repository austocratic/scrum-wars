"use strict";

var Firebase = require('../../libraries/firebase').Firebase;
var Slack = require('../../libraries/slack').Alert;
var attackCharacterComplete = require('../../slackTemplates/attackCharacterComplete').attackCharacterComplete;

exports.playerAttack = payload => {

    return new Promise((resolve, reject) => {
        
        //Get the name of the player to attack
        //TODO I currently populate the attack targets with player names.  I could populate names but populate targets with IDs
        var targetPlayer = payload.actions[0].value;

        //Return the default template
        var template = attackCharacterComplete();

        var firebase = new Firebase();

        //Get the slack user ID who made the selection
        var userID = payload.user_id;
        var channelID = payload.channel_id;

        //Use Slack user ID to lookup the user's character
        var get1 = firebase.get('character', 'user_id', userID);

        //Use Slack channel ID to lookup the zone id
        var get2 = firebase.get('zone', 'channel_id', channelID);

        //Use target to get the profile of the player's target
        var get3 = firebase.get('character', 'name', targetPlayer);

        //Wait for both above promises to resolve
        Promise.all([get1, get2, get3])
            .then( props => {

                var characterID = Object.keys(props[0])[0];
                var zoneID = Object.keys(props[1])[0];
                var targetCharacterID = Object.keys(props[2])[0];

                var characterProperties = props[0][characterID];
                console.log('Character stats: ', characterProperties);

                var characterZone = props[1][zoneID];
                console.log('Zone details: ', characterZone);

                var targetCharacterProperties = props[2][targetCharacterID];
                console.log('Target character stats: ', targetCharacterProperties);

                //TODO need to move this function somewhere else
                function getRandomIntInclusive(min, max) {
                    min = Math.ceil(min);
                    max = Math.floor(max);
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }

                //Determine if the target is defending
                var targetDefending = targetCharacterProperties.is_defending;

                var updates;

                //Get the attacking player's character name
                var attackerName = characterProperties.name;

                //Get the defending player's character name
                var defenderName = targetCharacterProperties.name;

                var alertDetails;

                //If target is defending, they will take no damage, instead remove is_defending
                if (targetDefending) {

                    updates = {
                        "is_defending": false
                    };

                    //Send a message to the channel saying that a new traveler has entered the zone
                    alertDetails = {
                        "username": "A mysterious voice",
                        "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                        "channel": ("#" + characterZone.channel),
                        "text": (attackerName + " moves in with a fierce strike, however " + defenderName + " blocks the attack!")
                    };

                    //Set the response template to display to all players in channel
                    template.response_type = "in_channel";

                    //Change template to reflect that the target defended
                    template.text = (attackerName + " moves in with a fierce strike, however " + defenderName + " blocks the attack!");
                    //template.attachments[0].text = (attackerName + " moves in with a fierce strike, however " + defenderName + " blocks the attack!");

                } else {

                    //TODO for phase 1 simplicity: damage will be a random # up to strength value
                    //Generate a random number based on character strength
                    var randomDamage = getRandomIntInclusive(1, characterProperties.strength);

                    //Target's current health
                    var targetHealth = targetCharacterProperties.hit_points;

                    var newHealth = (targetHealth - randomDamage);

                    //Define the properties to add to character
                    updates = {
                        "hit_points": newHealth
                    };

                    //Send a message to the channel saying that a new traveler has entered the zone
                    alertDetails = {
                        "username": "A mysterious voice",
                        "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                        "channel": ("#" + characterZone.channel),
                        "text": (attackerName + " lunges forward with a powerful strike and lands a crushing blow on " + defenderName + " for " + randomDamage + " points of damage!")
                    };

                    //Set the response template to display to all players in channel
                    template.response_type = "in_channel";

                    template.text = (attackerName + " lunges forward with a powerful strike and lands a crushing blow on " + defenderName + " for " + randomDamage + " points of damage!");
                    //template.attachments[0].text = (attackerName + " lunges forward with a powerful strike and lands a crushing blow on " + defenderName + " for " + randomDamage + " points of damage!");

                }

                //Create a new slack alert object
                var channelAlert = new Slack(alertDetails);

                //Send alert to slack
                channelAlert.sendToSlack(this.params)
                    .then(() =>{
                        console.log('Successfully posted to slack')
                    })
                    .catch(error =>{
                        console.log('Error when sending to slack: ', error)
                    });

                //Create a table reference to be used for locating the character
                var tableRef = 'character/' + targetCharacterID;

                console.log('Updates: ', updates);

                console.log('Final attack template: ', template);

                //Change target attributes
                firebase.update(tableRef, updates)
                    .then( () => {
                        //Then return the new template
                        resolve(template)
                    })
            })
    });
};







