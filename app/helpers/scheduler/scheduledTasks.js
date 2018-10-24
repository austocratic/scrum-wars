
const Scheduler = require('./scheduler').Scheduler;
const getGame = require('../../middleware/getGame').getGame;
const refreshController = require('../../controllers/gameControllers/refresh');
const Zone = require('../../models/Zone').Zone;
const Match = require('../../models/Match').Match;

const processTradeskills = require('../../controllers/gameControllers/processTradeskills');

//Create a cron object to process scheduled tasks
let oneMinuteCron = new Scheduler({
    delay: 60000,
    processes: [
        {
            action: async ()=>{
                console.log('Info: scheduler triggered');

                //gets DB state and sets to game.state & calls game.initiateRequest() to calculate values in memory
                let game = await getGame();

                //Declare standard game objects passing in an empty request object
                //let gameObjects = declareGameObjects(game, {});
                let gameObjects = {
                    currentMatch: new Match(game.state, game.getCurrentMatchID()),
                    lastMatch: new Match(game.state, game.getLastMatchID()),
                    //TODO should not hard code here
                    arenaZone: new Zone(game.state, "C4Z7F8XMW"),
                };

                gameObjects.game = game;

                //Execute functionality that does now exist in the refresh() function.  This is functionality that should not be executed on every player action

                //1) Call scrumdo API to get all cards in the icracked1 workspace
                //2) Find all cards in the complete state.
                //3) compare these cards against DB of "complete" cards.
                //4) Any complete cards, not in DB should be added to DB

                //TODO:
                //1) Add a scrumdo library for getting cards
                //2) Add a place to configure scrumdo settings such as:
                    //a) Scrumdo workspace name
                    //b) "Complete" column name

                await processTradeskills.processTradeskills(gameObjects);

                //Refresh the game (check for new turn, player deaths, ect.)
                refreshController.refresh(gameObjects);

                //Update game state
                game.updateState();

                console.log('Info: scheduler finished processing');
            }
        }
    ]
});

const startAll = () => {
    //Start the cron
    oneMinuteCron.start();
}


module.exports = {
    startAll
};