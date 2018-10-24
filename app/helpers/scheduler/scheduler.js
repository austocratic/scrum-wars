'use strict';

class Scheduler {
    constructor(args) {
        this.processes = args.processes;
        this.delay = args.delay;
    }

    _iterateAllProcesses() {
        try {
            this.processes.forEach( process => {
                process.action();
            })
        } catch(err){
            console.log('ERROR: when processing a scheduler process - ', err)
        }
    }

    start() {
        this.interval = setInterval( () => {
            this._iterateAllProcesses()
        }, this.delay);
    }
}

module.exports = {
    Scheduler
};








