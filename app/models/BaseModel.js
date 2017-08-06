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
    
}




module.exports = {
    BaseModel: BaseModel
};

