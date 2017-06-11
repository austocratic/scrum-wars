'use strict';

var Firebase = require('../libraries/firebase').Firebase;

var firebase = new Firebase();

//This Class will not be exported because it should never be required directly.  Only its child classes should be required


class FirebaseBaseController {
    constructor() {}

    setByProperty(property, lookupID){

        return new Promise((resolve, reject)=> {
            firebase.get(this.fbType, property, lookupID)
            //firebase.get('character', characterProperty, lookupID)
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
            firebase.get(this.fbType + '/' + id)
            //firebase.get('character/' + this.characterID)
                .then(firebaseReturn => {

                    this.props = firebaseReturn;
                    this.props.id = id;
                    resolve()
                });
        })
    }
}

module.exports = {
    FirebaseBaseController: FirebaseBaseController
};
