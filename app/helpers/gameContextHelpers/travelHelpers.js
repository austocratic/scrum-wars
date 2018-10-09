


const checkForTravelToArenaAndMatchStart = (gameObjects) => {
    console.log("Info: called checkForTravelToArenaAndMatchStart()");
    
    //Determine if attempting to travel to the arena
     if(gameObjects.requestZone.props.name === "The Arena" && gameObjects.currentMatch.props.status === 'started'){
        console.log('Info: a character attempted to travel to the arena after match started');

        //Create object to send to Slack
        gameObjects.slackResponseTemplate = {
            "username": gameObjects.playerCharacter.props.name,
            "icon_url": gameObjects.game.baseURL + gameObjects.game.avatarPath + gameObjects.playerCharacter.props.gender + '/' + gameObjects.playerCharacter.props.avatar,
            "channel": ("#" + gameObjects.requestZone.props.channel),
            "text": "_You are unable to travel to this zone because a match has already started!_"
        };

        return gameObjects.slackResponseTemplate;
    }

    //Update the zone_id property locally
    gameObjects.playerCharacter.updateProperty('zone_id', gameObjects.requestZone.id);
}



module.exports = {
    checkForTravelToArenaAndMatchStart
};
