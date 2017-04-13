



exports.PostProfile = (req, res, next) => {
    
    console.log('PostProfile called');
    
    var attributes = {
        health: 10,
        attack: 15
    };

    res.status(200).send(attributes);
    
};