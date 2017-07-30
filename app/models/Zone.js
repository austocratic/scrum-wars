'use strict';

//var Firebase = require('../libraries/firebase').Firebase;
//var Slack = require('../libraries/slack').Alert;
//var FirebaseBaseController = require('./FirebaseBaseController').FirebaseBaseController;

//var firebase = new Firebase();


var _ = require('lodash');
var BaseModel = require('./BaseModel').BaseModel;


class Zone extends BaseModel{
    constructor(gameState, slackChannelID){
        super();

        var zones = gameState.zone;

        var zoneID = _.findKey(zones, {'channel_id': slackChannelID});

        //Set the character's props
        this.props = zones[zoneID];
        this.id = zoneID
    }


  

}




/*
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
}*/

module.exports = {
    Zone: Zone
};
