
const BaseAction = require('./BaseAction').BaseAction;


class BaseAttack extends BaseAction{
    constructor(gameObjects) {
        super(gameObjects);
    }

    _calculateDamage(damage, mitigation){

        var totalDamage = damage - mitigation;

        if (totalDamage < 0) {
            return 0;
        }

        return totalDamage;
    }
}

BaseAttack.validations = [
    ...BaseAction.validations
];



module.exports = {
    BaseAttack
};