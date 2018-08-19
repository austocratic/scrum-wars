"use strict";

const slack = require('../../libraries/slack').sendMessage;
const Character = require('../../models/Character').Character;


const checkForVictory = (gameObjects, charactersInZone) => {
    console.log('Info: called checkForVictory()');

    switch (gameObjects.currentMatch.props.type.name){
        case 'Free-for-all':

            //TODO currently a single refresh will not detect that players are dead and declare one as the winner
            //It will move dead characters in one refresh and declare the winner in the next refresh
            //Check for only one character left in zone (victory condition)
            if (charactersInZone.length === 1) {

                //Last character Object is the winner.  Create reference for ease of use
                let winningCharacter = charactersInZone[0];

                //Reward the winning character
                //TODO come up with randomization function for arena gold reward
                let arenaReward = 10;

                //Notify Slack about the winner
                slack({
                    "username": gameObjects.requestZone.props.zone_messages.name,
                    "icon_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + gameObjects.requestZone.props.zone_messages.image + '.bmp',
                    //TODO dont hardcode the arena
                    "channel": ("#arena"),
                    "attachments": [{
                        "text": `We have a winner! ${winningCharacter.props.name} emerges victorious from the battle!
                        \n${winningCharacter.props.name}'s receives today's prize of ${arenaReward} gold!`,
                        "color": gameObjects.game.menuColor
                    }]
                });

                //Increment that players win count
                winningCharacter.incrementProperty('match_wins', 1);

                //Increment that players win count
                winningCharacter.incrementProperty('gold', arenaReward);

                gameObjects.currentMatch.end(winningCharacter.id)
            }

            break;
        case 'Team Battle':

            //Determine what team each character in the zone is on.
            let characterTeams = charactersInZone.map(eachCharacterInZone=>{
                return gameObjects.currentMatch.props.teams
                    .map((eachTeam, index)=>{
                        if (eachTeam.includes(eachCharacterInZone.id)){
                            return index;
                        }})
                    .filter(eachElement=>{
                        return eachElement !== undefined
                    })
            });

            console.log('DEBUG: characterTeams: ', characterTeams);

            //Find unique teams
            const teamsWithLivingCharacters = [...new Set(characterTeams)];

            console.log('DEBUG: teamsWithLivingCharacters: ', characterTeams);

            //If one team with living characters left, that team wins!
            if (teamsWithLivingCharacters.length === 1){

                //Reward the winning character
                //TODO come up with randomization function for arena gold reward
                let arenaReward = 5;

                let winningCharacterIDs = gameObjects.currentMatch.props.teams[teamsWithLivingCharacters[0]];

                console.log('DEBUG: winningCharacter IDs: ', winningCharacterIDs);

                //Get character objects for winning team
                let winningCharacters = winningCharacterIDs.map(eachWinningCharacterId=>{
                    return new Character(gameObjects.game.state, eachWinningCharacterId)
                });

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

                    //Increment that players win count
                    eachWinningCharacter.incrementProperty('gold', arenaReward);
                });

                //Notify Slack about the winner
                slack({
                    "username": gameObjects.requestZone.props.zone_messages.name,
                    "icon_url": gameObjects.game.baseURL + gameObjects.game.thumbImagePath + gameObjects.requestZone.props.zone_messages.image + '.bmp',
                    //TODO dont hardcode the arena
                    "channel": ("#arena"),
                    "attachments": [{
                        "text": `A team is triumphant! ${winningCharacterNameString} emerge victorious from the battle!
                        \nThey each receive today's prize of ${arenaReward} gold!`,
                        "color": gameObjects.game.menuColor
                    }]
                });

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

