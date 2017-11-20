
const BaseAction = require('./BaseAction').BaseAction;
const _ = require('lodash');


class BaseAttack extends BaseAction{
    constructor(gameObjects) {
        super(gameObjects);
    }


}

BaseAttack.validations = [
    ...BaseAction.validations
];



module.exports = {
    BaseAttack
};