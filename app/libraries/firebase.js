
var request = require('request');
var rp = require('request-promise');

var CREDENTIAL = process.env.FIREBASE_KEY;

var firebaseName = 'scrum-wars';


class Firebase {
    constructor() {
        this._setOptions()
    }

    _setOptions() {
        this.options = {
            resolveWithFullResponse: true,
            json:                    true
        }
    }

    get(table, key, value) {

        //Default of key and or value not defined
        var localKey, localValue;

        if (key){
            localKey = 'orderBy="' + key;
        } else {
            localKey = '';
        }

        if (value){
            localValue = '"&equalTo="' + value
        } else {
            localValue = '';
        }

        this.options.uri = 'https://' + firebaseName + '.firebaseio.com/' + table + '.json?' + localKey + localValue + '"&auth=' + CREDENTIAL;

        //console.log('Options: ', this.options.uri);

        //this.options.body = data;

        return new Promise( (resolve, reject) => {
            request.get(this.options, (err, httpResponse, body) => {
                if (err) {
                    console.log('DB err results: ', err);
                    reject(err);
                }
                resolve(body);
            })
        })
    }
    
    update(table, data) {

        //this.options.uri = 'https://' + firebaseName + '.firebaseio.com/' + table + '.json?auth=' + CREDENTIAL;
        //this.options.body = data;

        var options = {
            method: 'PATCH',
            uri: 'https://' + firebaseName + '.firebaseio.com/' + table + '.json?auth=' + CREDENTIAL,
            body: data,
            json: true // Automatically stringifies the body to JSON
        };

        return new Promise( (resolve, reject) => {
            rp(options)
                .then( response => {
                    console.log('firebase.js updates response: ', response);
                    resolve(response)
                })
                .catch( err => {
                    console.log('firebase.js update method failed: ', err)
                });
        });


        /*
        return new Promise( (resolve, reject) => {
            request.patch(this.options, (err, httpResponse, body) => {
                if (err) {
                    reject(err);
                }
                resolve(body);
            })
        })*/
    }

    create(table, data) {

        this.options.uri = 'https://' + firebaseName + '.firebaseio.com/' + table + '.json?auth=' + CREDENTIAL;
        this.options.body = data;

        return new Promise( (resolve, reject) => {
            request.post(this.options, (err, httpResponse, body) => {
                if (err) {
                    reject(err);
                }
                resolve(body);
            })
        })
    }

    delete(table) {
        
        this.options.uri = 'https://' + firebaseName + '.firebaseio.com/' + table + '.json?auth=' + CREDENTIAL;

        //console.log('delete url: ', this.options.uri);

        return new Promise( (resolve, reject) => {
            request.delete(this.options, (err, httpResponse, body) => {
                if (err) {
                    console.log('DB err results: ', err);
                    reject(err);
                }
                resolve(body);
            })
        })
    }

    /*
    createOld(table, data) {

        this.options.uri = 'https://' + firebaseName + '.firebaseio.com/' + table + '.json?auth=' + CREDENTIAL;
        this.options.body = data;

        return new Promise( (resolve, reject) => {
            request.put(this.options, (err, httpResponse, body) => {
                if (err) {
                    reject(err);
                }
                resolve(body);
            })
        })
    }*/
}

module.exports = {
    Firebase: Firebase
};
