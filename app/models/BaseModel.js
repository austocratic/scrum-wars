'use strict';

const _ = require('lodash');


class BaseModel {
    constructor(gameState, modelType, id) {

        //console.log('ID: ', id);

        if (!gameState[modelType]) {
            throw ('Failed to find the model type, ' + modelType + ' in the database')
        }
        let models = gameState[modelType];

        //If not found in database, throw error
        if (!models[id]){
            throw ('Failed to find the model type: ' + modelType + ', id: ' + id)
        }
    }

    /*
    setProperty(propertyToSet, valueToSet){

        this.props[propertyToUpdate] = newValue
    }*/
    
    updateProperty(propertyToUpdate, newValue){
        console.log(`Called updateProperty.  Updating property: ${propertyToUpdate} to ${newValue}`);
        //this.props[propertyToUpdate] = newValue
        _.set(this.props, propertyToUpdate , newValue);
    }

    //Property name can be nested
    incrementProperty(propertyName, value){
        console.log(`Called incrementProperty, value to increment: ${value}`);

        if(_.has(this.props, propertyName)){
            _.set(this.props, propertyName , _.get(this.props, propertyName) + value);
        } else {
            return new Error(`Can't find property ${propertyName}`)
        }
    }

    //Take a base object (base), for every key in newProperties that already exists in base, add to the base's value
    //If key does not exist on base, add that key:value
    accumulateProperties(base, newProperties){

        //Look at modifiers property
        let newPropertyKeys = Object.keys(newProperties);

        newPropertyKeys.forEach( eachPropertyKey =>{

            //If the property exists, increment it, otherwise add it
            if (base[eachPropertyKey]) {
                base[eachPropertyKey] = base[eachPropertyKey] + newProperties[eachPropertyKey];
            } else {
                base = Object.assign(base, {[eachPropertyKey]: newProperties[eachPropertyKey]})
            }
        });
        
        return base;
    }
    
}




module.exports = {
    BaseModel: BaseModel
};

