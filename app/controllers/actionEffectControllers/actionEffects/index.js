"use strict";

const path = require('path');


//Export all files in this folder dynamically
require('fs').readdirSync(__dirname)
//Filter out this file (the index file)
    .filter( eachFileName =>{
        return eachFileName !== 'index.js'
    })
    .forEach( eachFilteredFileName =>{
        module.exports[path.basename(eachFilteredFileName, '.js')] = require(path.join(__dirname, eachFilteredFileName))[path.basename(eachFilteredFileName, '.js')];
    });

