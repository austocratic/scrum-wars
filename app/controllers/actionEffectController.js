"use strict";

const actionEffectController = require('./actionEffectControllers/actionEffects/index');

const { DamageOverTime } = actionEffectController;

const actionEffectControllers = {
    'damageOverTime': DamageOverTime,
};

//Validate that the effect's function exists, in the above mapping, and return the controller function
const getActionEffectController = actionEffectFunctionName => {
    console.log('Called getActionEffectController');

    console.log('DEBUGGING actionEffectController: ', actionEffectController);

    console.log('DEBUGGING getActionEffectController: ', actionEffectControllers);

    console.log('DEBUGGING getActionEffectController damageOverTime: ', actionEffectControllers['damageOverTime']);


    //If the function name is not defined, throw an error
    if (!actionEffectControllers[actionEffectFunctionName]){
        throw new Error(`called actionEffectController.js getActionEffectController() for a function that does not exist! 
        nonexistent function name: ${actionEffectFunctionName}`)
    }

    return actionEffectControllers[actionEffectFunctionName];
};


module.exports = {
    getActionEffectController
};

