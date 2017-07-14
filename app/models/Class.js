var BaseModel = require('./BaseModel').BaseModel;
var slackTemplates = require('../slackTemplates');


class Class extends BaseModel{
    constructor(gameState, classID){
        super();

        var classes = gameState.class;

        //Set the character's props
        this.props = classes[classID];
        this.id = classID
    }
}



module.exports = {
    Class: Class
};

