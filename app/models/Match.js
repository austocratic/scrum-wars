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

        //Update properties related to starting the match
        this.updateProperty('date_started', Date.now());
        this.updateProperty('status', 'started');
        this.updateProperty('starting_character_ids', startingCharacterIds);

        //Lookup what match type for today's match

        //Read the player_teams property.  If there is no player_teams property, then return # of starting characters
        //TODO add logic to see if number of starting charactes is less than number of teams
        let numberOfPlayerTeams = _.get(this, 'props.type.player_teams', startingCharacterIds.length);

        //console.log('numberOfPlayerTeams: ', numberOfPlayerTeams);

        let teams = [];

        //Create nested arrays for each team
        do {
            teams.push([])

        } while (teams.length < numberOfPlayerTeams);

        //Iterate through all characters in the match and assign them to teams
        startingCharacterIds.forEach(eachCharacterID=>{

            let numberOfPlayersPerTeam = teams.map(eachTeam=>{
                return eachTeam.length
            });

            //console.log('numberOfPlayersPerTeam: ', numberOfPlayersPerTeam);

            let maxNumberOfPlayers = Math.max(...numberOfPlayersPerTeam);

            //console.log('Team with most players has: ', maxNumberOfPlayers);

            //Get the indexes of team(s) with the most players
            let teamsWithMostPlayers = numberOfPlayersPerTeam
                .map((eachTeam, index) =>{
                    //console.log('filter function, eachTeam: ', eachTeam);
                    if (eachTeam === maxNumberOfPlayers) {
                        //console.log('returning index of: ', index);
                        return index
                    }
                })
                .filter( eachTeam=>{
                    return eachTeam !== undefined;
                });

            //console.log('teamsWithMostPlayers: ', teamsWithMostPlayers);

            //Assign a random team
            let teamAssigned = Math.floor(Math.random() * (numberOfPlayerTeams));

            //console.log('assigned to team: ', teamAssigned);

            //If all teams are ties for most # of players, assign the player to the random team determined and exit
            if (teams.length === teamsWithMostPlayers.length){
                teams[teamAssigned].push(eachCharacterID);
                return;
            }

            //If the random team assigned has a max number of players already, reassign to a new team and check again
            while(teamsWithMostPlayers.indexOf(teamAssigned) >= 0) {
                teamAssigned = Math.floor(Math.random() * (numberOfPlayerTeams));
                //console.log('reassigning to team: ', teamAssigned);
            }

            //console.log('Assigning player to team: ', teamAssigned);

            //Push character ID into team assigned
            teams[teamAssigned].push(eachCharacterID);
        });

        //console.log('teams assigned: ', teams);

        //Now assign the teams to the match
        this.props.teams = teams;

    }

    end(){

        this.updateProperty('date_ended', Date.now());
        //Temporarily removing character ID, this won't support team wins (multiple winning characters)
        //this.updateProperty('character_id_won', winningCharacterID);
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