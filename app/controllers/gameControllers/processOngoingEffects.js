"use strict";

//const getActionEffectController = require('../actionEffectController').getActionEffectController;

//const helpers = require('../../helpers');

const slack = require('../../libraries/slack').sendMessage;

//Models
//const Action = require('../../models/Action').Action;
//const Character = require('../../models/Character').Character;

const processOngoingEffects = (gameObjects, charactersInZone) => {
    console.log('called processingOngoingEffects()');

    charactersInZone.forEach( eachCharacter => {
        //If the character has effects on them, determine if that effect should fade
        if(eachCharacter.props.effects) {
            eachCharacter.props.effects.forEach( (eachEffect, index) => {
                //If effect has no end_turn, it stays permanently
                if(eachEffect.end_turn){
                    if(gameObjects.currentMatch.props.number_turns >= eachEffect.end_turn){
                        //console.log(`DEBUG found an effect to fade, deleting effect at index ${index}`);

                        //Delete that effect
                        eachCharacter.props.effects.splice(index, 1);

                        //console.log('DEBUG gameObjects.requestZone.props.channel: ', gameObjects.requestZone.props.channel);

                        slack({
                            "username": eachCharacter.props.name,
                            "icon_url": gameObjects.game.baseURL + gameObjects.game.avatarPath + eachCharacter.props.gender + '/' + eachCharacter.props.avatar,
                            "channel": ("#" + gameObjects.requestZone.props.channel),
                            "attachments": [{
                                "text": `_${eachCharacter.props.name}'s ${eachEffect.name} fades away_`,
                                "color": gameObjects.game.menuColor
                            }]
                        })
                    }
                }
            });
        }
    });
};




module.exports = {
    processOngoingEffects
};

