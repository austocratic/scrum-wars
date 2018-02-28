'use strict';

const slack = require('../libraries/slack');

const _ = require('lodash');
const BaseModel = require('./BaseModel').BaseModel;


class Match extends BaseModel{
    constructor(gameState, matchID){
        super(gameState, 'match', matchID);

        let matches = gameState.match;

        //Set the character's props
        this.props = matches[matchID];
        this.id = matchID

    }
    
    //Start the match
    start(startingCharacterIds){

        this.updateProperty('date_started', Date.now());
        this.updateProperty('status', 'started');
        this.updateProperty('starting_character_ids', startingCharacterIds)
    }

    end(winningCharacterID){

        this.updateProperty('date_ended', Date.now());
        this.updateProperty('character_id_won', winningCharacterID);
        this.updateProperty('status', 'ended');
    }

    getStartingCharacterIDs(){
        if (this.props.starting_character_ids) {
            return this.props.starting_character_ids
        }
        
        return [];
    }

    incrementTurn(){
        this.incrementProperty('number_turns', 1);
    }
}










module.exports = {
    Match: Match
};