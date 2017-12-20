"use strict";

const _ = require('lodash');

//Models
const Game = require('../models/Game').Game;



const getGame = async (req) => {
    console.log('called Middleware: getGame()');

    let game = new Game();

    //Set the game state locally
    await game.getState();

    //Calculate properties in memory
    game.initiateRequest();

    //Refresh the game (check for new turn, player deaths, ect.)
    game.refresh();

    req.gameObjects.game = game;
};


module.exports = {
    getGame
};
