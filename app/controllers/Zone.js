'use strict';

var Firebase = require('../libraries/firebase').Firebase;
var Slack = require('../libraries/slack').Alert;
var FirebaseBaseController = require('./FirebaseBaseController').FirebaseBaseController;

var firebase = new Firebase();


class Zone extends FirebaseBaseController{
    constructor() {
        super();
        this.firebaseType = 'zone'
    }

    getCharacterIDsIncludePlayer(zoneID) {

        return new Promise((resolve, reject) => {

            //Get an array of all players in that zone
            firebase.get('character', 'zone_id', zoneID)
                .then(charactersInZone => {

                    //Get an array of all character IDs in the zone
                    var charactersInZoneIDs = Object.keys(charactersInZone);

                    console.log('Resolving names in zone (include player): ', JSON.stringify(charactersInZoneIDs));

                    resolve(charactersInZoneIDs);

                });
        });
    }
}

module.exports = {
    Zone: Zone
};
