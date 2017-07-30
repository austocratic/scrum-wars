'use strict';


class BaseModel {
    constructor() {}

    updateProperty(propertyToUpdate, newValue){

        this.props[propertyToUpdate] = newValue
    }

    incrementProperty(propertyName, value){

        var currentProperty = this.props[propertyName];

        this.props[propertyName] = currentProperty + value;
    }
    
}




module.exports = {
    BaseModel: BaseModel
};

