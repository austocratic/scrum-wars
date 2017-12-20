"use strict";

const updateGame = async (req) => {
    console.log('called Middleware: getGame()');

    //Overwrites with updated local props
    return await req.gameObjects.game.updateState();
};


module.exports = {
    updateGame
};
