"use strict";

const path = require('path');


//Export all files in this folder dynamically
require('fs').readdirSync(__dirname)
//Filter out this file (the index file)
    .filter( eachFileName =>{
        return eachFileName !== 'index.js'
    })
    .forEach( eachFilteredFileName =>{

        console.log('eachFilteredFileName: ', eachFilteredFileName);

        let pathToLog = require(path.join(__dirname, eachFilteredFileName))[path.basename(eachFilteredFileName, '.js')];
        console.log('DEBUG path to file: ', pathToLog);
        module.exports[path.basename(eachFilteredFileName, '.js')] = require(path.join(__dirname, eachFilteredFileName))[path.basename(eachFilteredFileName, '.js')];
    });


/*
module.exports = {
    DamageOverTime: '/Users/austo/Documents/code/scrum-wars/app/controllers/actionEffectControllers/actionEffects/DamageOverTime.js'
}*/