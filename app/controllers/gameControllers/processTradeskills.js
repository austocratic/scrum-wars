
const scrumdo = require('../../libraries/scrumdo')



// Use scrumdo library to get cards

const processTradeSkills = async (gameObjects) => {

    //Get scrumdo stories
    let scrumdoStoriesResult = await scrumdo.getAllStories()

    console.log("debug got card list: ", JSON.stringify(scrumdoStoriesResult[0]));
}


module.exports = {
    processTradeSkills
}