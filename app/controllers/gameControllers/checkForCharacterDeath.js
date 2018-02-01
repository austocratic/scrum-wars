"use strict";

const slack = require('../../libraries/slack').sendMessage;


const checkForCharacterDeath = (gameObjects, charactersInZone) => {
    console.log('called checkForCharacterDeath()');

    //console.log('DEBUG charactersInZone: ', charactersInZone);

    //Iterate through the characters in the zone and check if any are dead
    charactersInZone.forEach( eachCharacterInZone =>{
        console.log(`Checking ${eachCharacterInZone.props.name} hit points of: ${eachCharacterInZone.props.stats_current.hit_points}`);

        //If health has dropped below 0, character is dead
        if(eachCharacterInZone.props.stats_current.hit_points <= 0){
            console.log('Found a dead character!');

            //Announce that character has been defeated
            let characterDefeatedMessage = {
                "username": "Arena Announcer",
                "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                //TODO dont hardcode the arena
                "channel": ("#arena"),
                "text": `The crowd cheers as ${eachCharacterInZone.props.name} is defeated!`
            };

            slack(characterDefeatedMessage);

            //Move the character to the town
            //TODO currently hard coding to the town square
            eachCharacterInZone.updateProperty('zone_id', '-Khu9Zazk5XdFX9fD2Y8');
        }
    });
};




module.exports = {
    checkForCharacterDeath
};

