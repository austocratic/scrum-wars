

const axios = require('axios');

const BASE_URL = 'https://app.scrumdo.com/api/v3/organizations/icracked/'

//axios.defaults.headers.common['Authorization'] = `Basic ${process.env.SCRUMDO_KEY}`;

const getStories = async (page = 1) => {
    let getStoriesResponse = await axios({
        baseURL: BASE_URL,
        url: `projects/icracked1/stories?page=${page}`,
        headers: {
            Authorization: `Basic ${process.env.SCRUMDO_KEY}`
          }
    })
    .catch(err=>{console.log('Error: calling getStories(): ', err)})

    console.log('DEBUG: getStoriesResponse ', JSON.stringify(getStoriesResponse));
    console.log('DEBUG: response body: ', JSON.stringify(getStoriesResponse.body));
};

const getAllStories = async () => {
    let firstResults = await getStories();

    console.log("debug: got first set of scrumdo stories: ", JSON.stringify(firstResults[0]));

    let cardList = firstResults.items;

    //If more than 1 page of results, make multiple calls to get all pages of results
    if (firstResults.max_page > 1) {

        //Execute a getStories call for each page
        async () => {
            for (let page = 2; i < firstResults.max_page; x++) {
                let pageResults = await getStories(page);
                cardList.push(pageResults.items)
            }
        }
    }
    return cardList;
}



module.exports = {
    getAllStories
}