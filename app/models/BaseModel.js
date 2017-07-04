'use strict';


class BaseModel {
    constructor() {}

    updateProperty(propertyToUpdate, newValue){

        this.props[propertyToUpdate] = newValue
        
    }
    
}




module.exports = {
    BaseModel: BaseModel
};

