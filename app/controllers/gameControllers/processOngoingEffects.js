"use strict";

const getActionEffectController = require('../actionEffectController').getActionEffectController;

const helpers = require('../../helpers');

//Models
const Action = require('../../models/Action').Action;
const Character = require('../../models/Character').Character;

const processOngoingEffects = (gameObjects, charactersInZone) => {

    /*
    let charactersInZone = matchStartingCharacterIDs
        .map( eachMatchStartingCharacterID =>{
            return new Character(this.state, eachMatchStartingCharacterID);
        })
        //Filter starting characters for characters currently in the zone
        .filter( eachMatchStartingCharacter =>{
            return eachMatchStartingCharacter.props.zone_id === currentMatch.props.zone_id;
        });*/

    //Do I need to filter for only characters in the match?  Probably not, refresh should apply to all entire game

    //For each character in the zone lookup IDs of all effects
    charactersInZone.forEach( eachCharacter => {

        //If the character has effects on them, process them
        if( eachCharacter.props.effects ) {
            eachCharacter.props.effects.forEach( eachEffect => {

                let effectAction = new Action(gameObjects.game.state, eachEffect.action_id);

                //Get the character who applied the effect.
                let playerCharacter = new Character(gameObjects.game.state, eachEffect.applied_by_character_id);

                //If the action has ongoing effects, process them
                if (effectAction.props.ongoing_effects){
                    effectAction.props.ongoing_effects.forEach( eachOngoingEffect =>{

                        //Check if the action has an ongoing effect that should apply to the current turn.
                        //Also check that the effect has not already been processed this turn
                        if(eachOngoingEffect.active_on_turn.includes(gameObjects.currentMatch.props.number_turns - eachEffect.turn_applied) &&
                            //Don't need the relative turn here
                            !eachEffect.turn_effect_processed.includes(gameObjects.currentMatch.props.number_turns)
                        ){
                            //console.log('DEBUG the effect SHOULD be applied this turn!  Activating it!');

                            //Declare the Class function without invoking, so I can then validate
                            const actionEffectObjectToMake = getActionEffectController(eachOngoingEffect.functionName);

                            //TODO how to access these objects like actionCharacter, currentZone, are they necessary?
                            let gameObjects = {
                                game: {
                                    baseURL: this.baseURL,
                                    avatarPath: this.avatarPath,
                                    skillImagePath: this.skillImagePath
                                },
                                targetCharacter: eachCharacter,
                                //TODO for now the currentZone is hard coded.  In the future, refresh() should iterate through all zones and pass each into gameObjects
                                requestZone: {
                                    props: {
                                        channel : "arena",
                                        channel_id : "C4Z7F8XMW",
                                        name : "The Arena"
                                    }
                                },
                                playerCharacter
                            };

                            //Invoke validation function using the classes's attached validation properties before instantiating the class
                            helpers.validateGameObjects(gameObjects, actionEffectObjectToMake.validations);

                            let actionEffectObject = new actionEffectObjectToMake(gameObjects);

                            actionEffectObject.initiate();

                            //Mark that ongoing effect as used this turn, this prevents duplicate processing
                            eachCharacter.updateEffectProcessed(effectAction.id, gameObjects.currentMatch.props.number_turns)
                        }
                    })
                }
            })
        }
    });
};




module.exports = {
    processOngoingEffects
};

