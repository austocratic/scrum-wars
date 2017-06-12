'use strict';

var Firebase = require('../libraries/firebase').Firebase;

var firebase = new Firebase();

//This Class will not be exported because it should never be required directly.  Only its child classes should be required


class FirebaseBaseController {
    constructor() {}

    setByProperty(property, lookupID){

        return new Promise((resolve, reject)=> {
            firebase.get(this.firebaseType, property, lookupID)
                .then(firebaseReturn => {
                    
                    //Convert the returned object into array of IDs.  This works since the query only returns one result
                    //TODO need to add a way for it to verify only one result (could return multiple results)
                    var id = Object.keys(firebaseReturn)[0];
                    this.props = firebaseReturn[id];
                    resolve();
                })
        });
    }
    
    setByID(id){
        return new Promise((resolve, reject)=>{
            firebase.get(this.firebaseType + '/' + id)
                .then(firebaseReturn => {

                    this.props = firebaseReturn;
                    this.props.id = id;
                    resolve()
                });
        })
    }
    
    //TODO need to make this able to update multiple properties in one call
    updateProperty(propertyToUpdate, newValue){
        return new Promise((resolve, reject)=>{
            //Build a table reference to be used for query
            var tableRef = this.firebaseType + '/' + this.props.id;

            //Define the properties to add to character
            var updates = {
                [propertyToUpdate]: newValue
            };

            //Now update the character with new properties
            firebase.update(tableRef, updates)
                .then( () => {
                    resolve();
                });
        })
    }
    
    
}

module.exports = {
    FirebaseBaseController: FirebaseBaseController
};
