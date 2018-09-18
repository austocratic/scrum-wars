'use strict';

class Scheduler {
    constructor(args) {
        this.processes = args.processes;
        this.delay = args.delay;
        //this.interval = '';

        //arguments[1] = arguments[1] ? arguments[1] : 0; // ternary operator
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

    /*
    stopCron() {
        clearInterval(this.interval);
    }

    addTask(name, process) {

        var task = new Process(name, process);

        task.setProcessLogID(this._addToProcessLog(task));
    }

    _addToProcessLog(process){
        return (this.processList.push(process) - 1);
    }*/
}

/*
class Process {
    constructor(name, action) {
        this.name = name;
        this.action = action;
    }

    setProcessLogID(id) {
        this.processLogID = id;
    }

    //TODO: add an 'active' property.  cron will only call Processes with active = true
}*/


module.exports = {
    Scheduler
};








