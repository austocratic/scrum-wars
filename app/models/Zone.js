'use strict';

var _ = require('lodash');
var BaseModel = require('./BaseModel').BaseModel;


class Zone extends BaseModel{
    constructor(gameState, slackChannelID){
        
        var zones = gameState.zone;

        var zoneID = _.findKey(zones, {'channel_id': slackChannelID});

        super(gameState, 'zone', zoneID);

        //Set the character's props
        this.props = zones[zoneID];
        this.id = zoneID
    }


  

}


module.exports = {
    Zone: Zone
};
