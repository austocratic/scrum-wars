"use strict";

const slack = require('../../libraries/slack').sendMessage;


const checkForCharacterDeath = (gameObjects, charactersInZone) => {
    console.log('called checkForCharacterDeath()');

    //console.log('DEBUG charactersInZone: ', charactersInZone);

    //Iterate through the characters in the zone and check if any are dead
    charactersInZone.forEach( eachCharacterInZone =>{
        console.log(`Checking ${eachCharacterInZone.props.name} health of: ${eachCharacterInZone.props.hit_points}`);

        //If health has dropped below 0, character is dead
        if(eachCharacterInZone.props.hit_points <= 0){
            console.log('Found a dead character!');

            slack({
                "username": gameObjects.matchZone.props.zone_messages.name,
                "icon_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + gameObjects.matchZone.props.zone_messages.image + '.bmp',
                "channel": ("#" + gameObjects.matchZone.props.channel),
                "attachments": [{
                    "text": `The crowd cheers as ${eachCharacterInZone.props.name} is defeated!`,
                    "color": gameObjects.game.menuColor
                }]
            });

            //Move the character to the town
            //TODO currently hard coding to the town square
            //TODO maybe use the travel function so that an announcement is made?
            eachCharacterInZone.updateProperty('zone_id', '-Khu9Zazk5XdFX9fD2Y8');
        }
    });
};




module.exports = {
    checkForCharacterDeath
};

