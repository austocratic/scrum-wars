"use strict";

const _ = require('lodash');

const slack = require('../../libraries/slack').sendMessage;
const Character = require('../../models/Character').Character;

const earnExperienceAndCheckForLevel = require('../../helpers/characterHelpers').earnExperienceAndCheckForLevel;
const validateGameObjects = require('../../helpers/helpers').validateGameObjects;

//This may not be the best place to put this function, but this way I dont have to repeat code by putting it within each match type's victory condition
const rewardParticipants = gameObjects => {
    
    let participantXpReward = gameObjects.game.state.settings.match.participant_xp;
    
    //Get all participant's IDs
    let matchParticipants = gameObjects.currentMatch.getStartingCharacterIDs()

    //For each participating character ID, create a character obj, aware xp, and check for level up
    matchParticipants.forEach(eachParticipantId => {
        let participatingCharacter = new Character(gameObjects.game.state, eachParticipantId)
        earnExperienceAndCheckForLevel(gameObjects, participatingCharacter, participantXpReward)
        //participatingCharacter.incrementProperty('experience', participantXpReward);
    });
}

const checkForVictory = (gameObjects, charactersInZone) => {
    console.log('Info: called checkForVictory()');

    let participantXpReward = gameObjects.game.state.settings.match.participant_xp;

    switch (gameObjects.currentMatch.props.type.name){
        case 'Free-for-all':

            validateGameObjects(gameObjects, [
                'game',
                'arenaZone'
            ]);

            //TODO currently a single refresh will not detect that players are dead and declare one as the winner
            //It will move dead characters in one refresh and declare the winner in the next refresh
            //Check for only one character left in zone (victory condition)
            if (charactersInZone.length === 1) {

                //Last character Object is the winner.  Create reference for ease of use
                let winningCharacter = charactersInZone[0];

                //Reward the winning character
                let winnerGoldReward = gameObjects.game.state.settings.match.free_for_all.victory_gold_base + _.random(1, 10);
                let winnerXpReward = gameObjects.game.state.settings.match.free_for_all.victory_xp;
                
                //Notify Slack about the winner
                slack({
                    "username": gameObjects.arenaZone.props.zone_messages.name,
                    "icon_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + gameObjects.arenaZone.props.zone_messages.image + '.bmp',
                    //TODO dont hardcode the arena
                    "channel": ("#arena"),
                    "attachments": [{
                        "text": `We have a winner! ${winningCharacter.props.name} emerges victorious from the battle!
                        \n${winningCharacter.props.name} receives today's prize of ${winnerGoldReward} gold & earns ${winnerXpReward} experience for the glorious victory!
                        \nAll of today's participants earn ${participantXpReward} for their thrilling display!`,
                        "color": gameObjects.game.menuColor
                    }]
                });

                //Increment character by winning amounts
                winningCharacter.incrementProperty('match_wins', 1);
                winningCharacter.incrementProperty('gold', winnerGoldReward);
                earnExperienceAndCheckForLevel(gameObjects, winningCharacter, winnerXpReward)

                //Reward all characters
                rewardParticipants(gameObjects)
              
                gameObjects.currentMatch.end(winningCharacter.id)
            }

            break;
        case 'Team Battle':

            //Determine what team each character in the zone is on.
            let characterTeams = charactersInZone.map(eachCharacterInZone=>{
                let characterTeamArray = gameObjects.currentMatch.props.teams
                    .map((eachTeam, index)=>{
                        if (eachTeam.includes(eachCharacterInZone.id)){
                            return index;
                        }})
                    .filter(eachElement=>{
                        return eachElement !== undefined
                    });

                return characterTeamArray[0]
            });

            //console.log('DEBUG: characterTeams: ', characterTeams);

            //Find unique teams
            const teamsWithLivingCharacters = [...new Set(characterTeams)];

            //console.log('DEBUG: teamsWithLivingCharacters: ', teamsWithLivingCharacters);

            //If one team with living characters left, that team wins!
            if (teamsWithLivingCharacters.length === 1){

                //Reward the winning character
                //TODO come up with randomization function for arena gold reward
                //let arenaReward = 5;
                //Reward the characters on the winning team
                let winnerGoldReward = gameObjects.game.state.settings.match.team_battle.victory_gold_base + _.random(1, 10);
                let winnerXpReward = gameObjects.game.state.settings.match.team_battle.victory_xp;

                let winningCharacterIDs = gameObjects.currentMatch.props.teams[teamsWithLivingCharacters[0]];

                //console.log('DEBUG: winningCharacter IDs: ', winningCharacterIDs);

                //Get character objects for winning team
                let winningCharacters = winningCharacterIDs.map(eachWinningCharacterId=>new Character(gameObjects.game.state, eachWinningCharacterId));

                let winningCharacterNameString = '';

                winningCharacters.forEach((eachWinningCharacter, index)=>{

                    //First winning character name, format into string differently:
                    if (index === 0){
                        winningCharacterNameString = winningCharacterNameString + `${eachWinningCharacter.props.name}`;
                    } else {
                        winningCharacterNameString = winningCharacterNameString + `, ${eachWinningCharacter.props.name}`;
                    }

                    //Increment that players win count
                    eachWinningCharacter.incrementProperty('match_wins', 1);
                    eachWinningCharacter.incrementProperty('gold', winnerGoldReward);
                    earnExperienceAndCheckForLevel(gameObjects, eachWinningCharacter, winnerXpReward)
                });

                //Notify Slack about the winner
                slack({
                    "username": gameObjects.requestZone.props.zone_messages.name,
                    "icon_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + gameObjects.requestZone.props.zone_messages.image + '.bmp',
                    //TODO dont hardcode the arena
                    "channel": ("#arena"),
                    "attachments": [{
                        "text": `A team is triumphant! ${winningCharacterNameString} emerge victorious from the battle!
                        \nThey each receive today's prize of ${winnerGoldReward} gold & ${winnerXpReward}!
                        \nAll of today's participants earn ${participantXpReward} for their thrilling display!`,
                        "color": gameObjects.game.menuColor
                    }]
                });

                //Reward all characters
                rewardParticipants(gameObjects)

                gameObjects.currentMatch.end()
            }

            break;
        default:
            console.log('ERROR: checkForVictory() called with an unknown match type:', gameObjects.currentMatch.props.type.name)

    }



};




module.exports = {
    checkForVictory
};

