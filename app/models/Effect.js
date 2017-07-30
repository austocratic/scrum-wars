'use strict';

var _ = require('lodash');
var BaseModel = require('./BaseModel').BaseModel;


class Effect extends BaseModel{
    constructor(gameState, effectID){
        super();

        var effects = gameState.effect;

        //Set the character's props
        this.props = effects[effectID];
        this.id = effectID
    }
    
    /*
    changeAttribute(targetID, value){
        console.log('Called effect.activate');

        var currentHP = this.props.character[targetID].hit_points;
        
        console.log('currentHP: ', currentHP);

        this.props.character[targetID].hit_points = currentHP - value;
        
        console.log('Updated currentHP: ', )
        
    }*/


}


module.exports = {
    Effect: Effect
};
