
var request = require('request');

var CREDENTIAL = process.env.FIREBASE_KEY;

var firebaseName = 'scrum-wars';
var baseURL = 'https://' + firebaseName + '.firebaseio.com/data.json?auth=' + CREDENTIAL;


class Firebase {
    constructor() {
        this._setOptions()
    }

    _setOptions() {
        this.options = {
            uri:                     'https://scrum-wars.firebaseio.com/.json?auth=' + CREDENTIAL,
            resolveWithFullResponse: true,
            json:                    true
        }
    }

    update(data) {

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

    create(data) {

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
