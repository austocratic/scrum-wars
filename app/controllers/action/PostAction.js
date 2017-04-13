
var Alert = require('../../../app/libraries/slack').Alert;


exports.PostAction = (req, res, next) => {

    var action = req.body.actions[0].value;

    var slackResponse = {
        "text": ("Action triggered: " + action)
    };
    
    //Create a new slack message
    var actionMessage = new Alert(slackResponse);
    
    actionMessage.sendToSlack(actionMessage.options);

    res.status(200).send(slackResponse);
};