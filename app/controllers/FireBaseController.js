'use strict';

var Firebase = require('../libraries/firebase').Firebase;

var firebase = new Firebase();

//This Class will not be exported because it should never be required directly.  Only its child classes should be required

class FirebaseController {
    constructor() {}

    setByProperty(property, lookupID){

        console.log('Called setByProperty, property: ', property);
        console.log('Called setByProperty, lookupID: ', lookupID);
        return new Promise((resolve, reject)=> {
            firebase.get(this.fbType, property, lookupID)
            //firebase.get('character', characterProperty, lookupID)
                .then(firebaseReturn => {

                    console.log('setByProperty return: ', firebaseReturn);
                    //Convert the returned object into array of IDs.  This works since the query only returns one result
                    //TODO need to add a way for it to verify only one result (could return multiple results)
                    var id = Object.keys(firebaseReturn)[0];
                    this.props = firebaseReturn[id];
                    resolve();
                })
        });
    }

    setByID(id){
        console.log('Called setbyID, this.characterID: ', id);
        return new Promise((resolve, reject)=>{
            firebase.get(this.fbType + '/' + id)
            //firebase.get('character/' + this.characterID)
                .then(firebaseReturn => {

                    console.log('setByID return: ', firebaseReturn);
                    this.props = firebaseReturn;
                    this.props.id = id;
                    resolve()
                });
        })
    }
}

module.exports = {
    FirebaseController: FirebaseController
};
