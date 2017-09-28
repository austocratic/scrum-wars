
var _ = require('lodash');
const BaseAction = require('./BaseAction').BaseAction;

class BaseModify extends BaseAction{
    constructor(gameObjects) {
        super(gameObjects);

        this.targetCharacter = gameObjects.targetCharacter;
    }

    _reverseEffectsOfType(character, effectType){

        var characterEffects = character.props.effects;

        //Lookup all actionControllers that have the same type as the actionTaken
        var effectsOfSameType = _.filter(characterEffects, {type: effectType});

        console.log('effectsOfSameType: ', effectsOfSameType);

        effectsOfSameType.forEach( eachEffect =>{
            this._reverseEffect(this.targetCharacter, eachEffect.action_id);
        });
    }
}

/*
BaseModify.validations = [
    ...BaseAction.validations
];*/


module.exports = {
    BaseModify
};