
var Alert = require('../../../app/libraries/slack').Alert;


exports.PostAction = (req, res, next) => {

    console.log('PostAction called, req: ', req.body);

    var payload = JSON.parse(req.body.payload);

    console.log('payload: ', payload);

    //var action = req.body.payload.actions[0].value;
    var action = payload.actions[0].value;


    var slackResponse = {
        "text": ("Action triggered: " + action)
    };
    
    //Create a new slack message
    var actionMessage = new Alert(slackResponse);
    
    actionMessage.sendToSlack(actionMessage.options);

    res.status(200).send(slackResponse);
};