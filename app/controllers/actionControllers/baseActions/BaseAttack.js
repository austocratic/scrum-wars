
const BaseAction = require('./BaseAction').BaseAction;
const _ = require('lodash');


class BaseAttack extends BaseAction{
    constructor(gameObjects) {
        super(gameObjects);
    }



    _calculateDamage2(){

        let calculatedDamage = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);

        //Determine if target has an effect that prevents damage

        //


    }


}

BaseAttack.validations = [
    ...BaseAction.validations
];



module.exports = {
    BaseAttack
};