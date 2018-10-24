
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

    async get(table = '', key = '', value = '') {

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

        var options = {
            method: 'GET',
            uri: 'https://' + firebaseName + '.firebaseio.com/' + table + '.json?' + localKey + localValue + '"&auth=' + CREDENTIAL,
            json: true // Automatically stringifies the body to JSON
        };

        return await rp(options);
    }

    async update(table, data) {

        var options = {
            method: 'PATCH',
            uri: 'https://' + firebaseName + '.firebaseio.com/' + table + '.json?auth=' + CREDENTIAL,
            body: data,
            json: true // Automatically stringifies the body to JSON
        };
        
        rp(options)
            .then( response => {
                //console.log('firebase.js updates response: ', response);
                return(response)
            })
            .catch( err => {
                console.log('firebase.js update method failed: ', err)
            });
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
}

module.exports = {
    Firebase
};
