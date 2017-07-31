'use strict';

var Slack = require('../libraries/slack').Alert;

//Utility functions

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Action controllers



exports.attack = (actionCharacter, targetCharacter, actionZone) => {

    //Calculate the strength of the attack
    var baseDamage = actionCharacter.props.level;
    
    console.log('baseDamage: ', baseDamage);

    //TODO for phase 1 simplicity: damage will be a random # up to strength value
    //Generate a random number based on character strength
    var randomDamage = getRandomIntInclusive(1, actionCharacter.props.strength);

    console.log('randomDamage: ', randomDamage);

    var totalDamage = baseDamage + randomDamage;

    //Compare damage to defender's defense

    //Dexterity
    var evasionChance = .1;

    //Armor + toughness
    var damageReduction = 2;

    //Check if attack was evaded

    //Reduce the totalDamage by damageReduction (up to maximum of 90% reduction)
    var netDamage = totalDamage - damageReduction;

    console.log('netDamage: ', netDamage);

    //reduce target ID.hit_points
    targetCharacter.incrementProperty('hit_points', (-1 * netDamage));

    var alertDetails = {
        "username": "A mysterious voice",
        "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
        "channel": ("#" + actionZone.props.channel),
        "text": (actionCharacter.props.name + " lunges forward with a powerful strike and lands a crushing blow on " + targetCharacter.props.name + " for " + netDamage + " points of damage!")
    };

    //Create a new slack alert object
    var channelAlert = new Slack(alertDetails);

    //Send out channel update of the action
    channelAlert.sendToSlack(this.params);

    //Complete the action by returning a message
    return {
        "text": "You attack a character"
    };



    //Old code below





    /*
    //Target's current health
    var targetHealth = targetCharacterProperties.hit_points;

    var newHealth = (targetHealth - randomDamage);

    //Send a message to the channel saying that a new traveler has entered the zone
    alertDetails = {
        "username": "A mysterious voice",
        "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
        "channel": ("#" + characterZone.channel),
        "text": (attackerName + " lunges forward with a powerful strike and lands a crushing blow on " + defenderName + " for " + randomDamage + " points of damage!")
    };

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

    //Set the response template to display to all players in channel
    template.response_type = "in_channel";

    template.text = (attackerName + " lunges forward with a powerful strike and lands a crushing blow on " + defenderName + " for " + randomDamage + " points of damage!");
    //template.attachments[0].text = (attackerName + " lunges forward with a powerful strike and lands a crushing blow on " + defenderName + " for " + randomDamage + " points of damage!");
    */

};

