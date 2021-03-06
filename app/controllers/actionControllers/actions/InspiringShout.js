'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;
const Character = require('../../../models/Character').Character;

//Defensive Stance is a stance that increases AC & lowers attack
//Static success chance
class InspiringShout extends BaseAction {
    constructor(gameObjects, actionCharacter) {
        super(gameObjects, actionCharacter);

        this.baseSuccessChance = 1; //% chance of success
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;

        //this.playerActionFailedMessage = "Your attack fails!";
        //this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts to shout, but is distracted by the heat of combat!`;

        //Modifiers to apply on action success
        this.statsToModify = {
            strength: 5
        };

        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} let's loose an *inspiring bellow*!  All allies gain ${this.statsToModify.strength} strength!`;
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):

                //Find all character IDs on actionCharacter's team
                this.game.getCharacterIDsOnTeam(this.actionCharacter.id).forEach(eachCharacterIdOnTeam=>{
                    let eachCharacterOnTeam = new Character(this.game.state, eachCharacterIdOnTeam);

                    //Apply modifiers defined in constructor
                    this._applyEffect(eachCharacterOnTeam, this.statsToModify);
                });

                this.defaultActionPayload.attachments[0].text = this.channelActionSuccessMessage;
                slack.sendMessage(this.defaultActionPayload);

                return {
                    status: 'complete',
                    damageDealt: []
                };

                break;
            default:
                return this._getDefaultProcessResponse();
                break;
        }
    }
}


module.exports = {
    InspiringShout
};