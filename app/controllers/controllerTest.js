"use strict";

var Character = require('./Character').Character;


exports.controllerTest = () => {
    console.log('Called controllerTest');

    var localCharacter = new Character();

    console.log('Declared an object of type: ', localCharacter.fbType);

    localCharacter.setByID('-KkdlJPN_PdJCUydditm')
        .then(()=>{
            console.log('Successfully setByID');
            console.log('Properties: ', JSON.stringify(localCharacter.props))
        });

    var localCharacter2 = new Character();

    console.log('Declared an object of type: ', localCharacter2.fbType);

    localCharacter2.setByProperty('user_id', 'U4ZA6CCBG')
        .then(()=>{
            console.log('Successfully setByProperty');
            console.log('Properties: ', JSON.stringify(localCharacter2.props))
        })
};