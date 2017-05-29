"use strict";

var Firebase = require('../../libraries/firebase').Firebase;

var firebase = new Firebase();

exports.getCharacters = {

    includePlayerCharacter(zoneID) {

        return new Promise((resolve, reject) => {

            //Get an array of all players in that zone
            firebase.get('character', 'zone_id', zoneID)
                .then(charactersInZone => {

                    //Get an array of all character IDs in the zone
                    var charactersInZoneIDs = Object.keys(charactersInZone);

                    var namesInZone = charactersInZoneIDs.map(charID => {
                        return charactersInZone[charID].name;
                    });

                    console.log('Resolving names in zone (include player): ', JSON.stringify(namesInZone));

                    resolve(namesInZone);

                });
        });
    },

    excludePlayerCharacter(zoneID, characterID) {

        return new Promise((resolve, reject) => {

            //Get an array of all players in that zone
            firebase.get('character', 'zone_id', zoneID)
                .then(charactersInZone => {

                    //Get an array of all character IDs in the zone
                    var charactersInZoneIDs = Object.keys(charactersInZone);

                    //Get the array position of the player's character:
                    var playerCharacterArrayPosition = charactersInZoneIDs.indexOf(characterID);

                    //Remove player's character from the array
                    if (playerCharacterArrayPosition > -1) {
                        charactersInZoneIDs.splice(playerCharacterArrayPosition, 1);
                    }

                    var namesInZone = charactersInZoneIDs.map(charID => {
                        return charactersInZone[charID].name;
                    });

                    console.log('Resolving names in zone (exclude player): ', JSON.stringify(namesInZone));

                    resolve(namesInZone);

                });
        });
    }
};

/*
exports.getCharacters = {
    includePlayerCharacter: getCharacters.includePlayerCharacter,
    excludePlayerCharacter: getCharacters.excludePlayerCharacter
};*/