"use strict";

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const Scheduler = require('./app/libraries/scheduler').Scheduler;
const getGame = require('./app/middleware/getGame').getGame;
//const declareGameObjects = require('./app/middleware/declareGameObjects').declareGameObjects;
const refreshController = require('./app/controllers/gameControllers/refresh');
const Zone = require('./app/models/Zone').Zone;
const Match = require('./app/models/Match').Match;

const index = require('./routes/index');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

//Create a cron object to process scheduled tasks
let cron = new Scheduler({
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

                //TODO I probably should not tack on the game as a gameObject.  If I do it probably should not happen here
                gameObjects.game = game;

                //Refresh the game (check for new turn, player deaths, ect.)
                refreshController.refresh(gameObjects);

                //Update game state
                game.updateState();

                console.log('Info: scheduler finished processing');
            }
        }
    ]
});

//Start the cron
cron.start();


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.sendStatus(500)
});

module.exports = app;
