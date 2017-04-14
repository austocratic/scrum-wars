




exports.InteractiveMessages = (req, res, next) => {

    var messagePayload = JSON.parse(req.body.payload);

    console.log('Incoming interactive message, parsed body: ', messagePayload);
    
    var slackResponse = {
        "text": 'received input'
    };

    res.status(200).send(slackResponse);
};