
const _ = require('lodash');

const scrumdo = require('../../libraries/scrumdo')



// Use scrumdo library to get cards

const processTradeskills = async (gameObjects) => {
    console.log('Info: called processTradeskills()');

    //1) Call scrumdo API to get all cards in the icracked1 workspace
    let scrumdoStoriesResult = await scrumdo.getAllStories()

    console.log("debug got card list: ", JSON.stringify(scrumdoStoriesResult[0]));


    //2) Find all cards in the complete state.
    let completeCards = scrumdoStoriesResult
        // .filter(eachScrumdoStory=>{
        //     console.log('Debug .cell data type: ', typeof eachScrumdoStory.cell);
        //     return eachScrumdoStory.cell !== 'null'
        //     //return typeof eachScrumdoStory.cell === 'object'
        // })
        .filter(eachScrumdoStory => {
            if (typeof eachScrumdoStory.cell === 'object' && eachScrumdoStory.cell !== null){
                console.log('Debug, it was an object');
                if (eachScrumdoStory.cell.label){
                    console.log('Debug, it has a .label: ', eachScrumdoStory.cell.label);
                    return eachScrumdoStory.cell.label === 'Deployed to Prod | Done'
                }
            }
        })
    
        console.log('# of complete cards: ', completeCards.length);
        console.log('first complete card: ', completeCards[0]);

        // .filter(eachCompleteStory => {
        //     //Does the story already exist in the DB?
        //     return _.find(gameObjects.game.state.scrumdo_story, {card_id: eachCompleteStory.id})
        // })

   

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