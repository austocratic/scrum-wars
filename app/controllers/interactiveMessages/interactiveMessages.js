




exports.InteractiveMessages = (req, res, next) => {

    console.log('Incoming interactive message, req.body: ', req.body);
    
    var slackResponse = {
        "text": 'received input'
    };

    res.status(200).send(slackResponse);
};