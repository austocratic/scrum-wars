

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

    return getStoriesResponse.data
    //console.log('DEBUG: response body: ', getStoriesResponse.body);
};

const getAllStories = async () => {
    let firstResults = await getStories();

    let resultsArray = Object.keys(firstResults)

    resultsArray.forEach((eachResult)=>{console.log(eachResult);})

    //console.log('firstResults: ', firstResults);
    console.log('firstResults type of: ', typeof firstResults);

    // console.log('Debug: firstResults[0]', firstResults[0]);

    // //If more than 1 page of results, make multiple calls to get all pages of results
    // if (firstResults.max_page > 1) {

    //     //Execute a getStories call for each page
    //     async () => {
    //         for (let page = 2; i < firstResults.max_page; x++) {
    //             let pageResults = await getStories(page);
    //             cardList.push(pageResults.items)
    //         }
    //     }
    // }
    // return cardList;
}



module.exports = {
    getAllStories
}