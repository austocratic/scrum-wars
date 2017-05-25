

exports.actionCoolDown = (turnsToCoolDown) => {

    return {
        "text": "That action is still recharging and will be available in " + turnsToCoolDown + " more turns!"
    };

};