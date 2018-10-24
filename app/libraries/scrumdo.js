

const axios = require('axios');

const BASE_URL = 'https://app.scrumdo.com/api/v3/organizations/icracked'

axios.defaults.headers.common['Authorization'] = `Basic ${process.env.SCRUMDO_KEY}`;

const getStories = async (page = 1) => {
    return await axios.get(`${BASE_URL}/projects/icracked1/stories?page=${page}`);
}

const getAllStories = async () => {
    let firstResults = await getStories();

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