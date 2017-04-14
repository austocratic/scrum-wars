
var request = require('request');

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

/*
    get(table, data) {

        this.options.uri = 'https://' + firebaseName + '.firebaseio.com/' + table + '.json?auth=' + CREDENTIAL;
        this.options.body = data;

        return new Promise( (resolve, reject) => {
            request.patch(this.options, (err, httpResponse, body) => {
                if (err) {
                    reject(err);
                }
                resolve(body);
            })
        })
    }*/


    update(table, data) {

        this.options.uri = 'https://' + firebaseName + '.firebaseio.com/' + table + '.json?auth=' + CREDENTIAL;
        this.options.body = data;

        return new Promise( (resolve, reject) => {
            request.patch(this.options, (err, httpResponse, body) => {
                if (err) {
                    reject(err);
                }
                resolve(body);
            })
        })
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
}

module.exports = {
    Firebase: Firebase
};
