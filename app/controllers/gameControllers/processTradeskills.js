
const _ = require('lodash');

const scrumdo = require('../../libraries/scrumdo')



// Use scrumdo library to get cards

const processTradeskills = async (gameObjects) => {
    console.log('Info: called processTradeskills()');

    //1) Call scrumdo API to get all cards in the icracked1 workspace
    let scrumdoStoriesResult = await scrumdo.getAllStories()

    console.log("debug got card list: ", JSON.stringify(scrumdoStoriesResult[0]));


    //2) Find all cards in the complete state.
    // let completeCards = scrumdoStoriesResult
    //     .filter(eachScrumdoStory => {
    //         eachScrumdoStory.status === 'complete'
    //     })
    //     .filter(eachCompleteStory => {
    //         //Does the story already exist in the DB?
    //         return _.find(gameObjects.game.state.scrumdo_story, {card_id: eachCompleteStory.id})
    //     })

   

    //4) Any complete cards, not in DB should be added to DB

        //TODO:
        //1) Add a scrumdo library for getting cards
        //2) Add a place to configure scrumdo settings such as:
            //a) Scrumdo workspace name
            //b) "Complete" column name

    
}


module.exports = {
    processTradeskills
}