'use strict';

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


module.exports = {
    Zone: Zone
};
