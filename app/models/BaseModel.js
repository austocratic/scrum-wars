'use strict';


class BaseModel {
    constructor() {}

    updateProperty(propertyToUpdate, newValue){

        this.props[propertyToUpdate] = newValue
    }

    incrementProperty(propertyName, value){
        
        console.log('Called incrementProperty');
        console.log('incrementProperty, propertyName: ', propertyName);
        console.log('incrementProperty, value: ', value);

        var currentProperty = this.props[propertyName];

        this.props[propertyName] = currentProperty + value;
    }

    //Take a base object (base), for every key in newProperties that already exists in base, add to the base's value
    //If key does not exist on base, add that key:value
    accumulateProperties(base, newProperties){

        //Look at modifiers property
        var newPropertyKeys = Object.keys(newProperties);

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

