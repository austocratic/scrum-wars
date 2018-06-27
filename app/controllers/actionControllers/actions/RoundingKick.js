'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

class RoundingKick extends BaseAction {
    constructor(gameObjects, actionCharacter) {
        super(gameObjects, actionCharacter);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;

        //AOE Specific attributes
        this.maxTargetsAffected = 3;

        this.bonusDamage = this.actionCharacter.props.level;
        this.calculatedDamage = this._calculateMelee(this.actionTaken.props.damage_multiplier, this.bonusDamage);
        console.log(`${this.actionTaken.props.name} calculated damage of: ${this.calculatedDamage}`);

        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a *Rounding Kick* but stumbles!`;
        //this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} strikes with a *Rounding Kick* but ${this.targetCharacter.props.name} blocks the blow!`;
        //this.channelActionSuccessMessage = `${this.actionCharacter.props.name} fists become a blur, striking ${this.targetCharacter.props.name} for ${this.calculatedDamage} points of damage!
        //\n_${this.actionCharacter.props.name} generates ${this.actionTaken.props.vigor_generated} points of vigor!_`;
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        switch (true) {
            case (turn <= 0):
                this.defaultActionPayload.attachments[0].text = `${this.actionCharacter.props.name} crouches and prepares to deliver a *mighty kick*!`;
                this.defaultActionPayload.attachments[0].thumb_url = this.game.baseURL + this.game.thumbImagePath + '93.png';
                slack.sendMessage(this.defaultActionPayload);

                return {
                    status: 'pending',
                    damageDealt: []
                };

                break;
            case (turn === 1):
                if (this._dodgeCheck(this.targetCharacter, 0, 0) === false) {
                    this.defaultActionPayload.attachments[0].text = this.channelActionAvoidedMessage;
                    slack.sendMessage(this.defaultActionPayload);
                    return {
                        status: 'complete',
                        damageDealt: [{
                            targetID: this.targetCharacter.id,
                            range: this.actionTaken.props.range,
                            damageAmount: 0
                        }]};
                }

                let targets = this._getUniqueRandomTarget(this.maxTargetsAffected);

                let results = targets
                    .filter( eachTarget =>{

                        //First filter for only attacks that hit, then send avoid messages
                        let dodgeCheck = this._dodgeCheck(this.targetCharacter, 0, 0);

                        if (dodgeCheck === false){
                            this.defaultActionPayload.attachments[0].text = `${eachTarget.props.name} evades ${this.actionCharacter.props.name}'s *Rounding Kick*!`;
                            slack.sendMessage(this.defaultActionPayload);
                        }

                        return dodgeCheck;
                    })
                    .map(targetHit=>{

                        let calculatedDamage = this._calculateMelee(this.actionTaken.props.damage_multiplier, this.bonusDamage);

                        //Process damage & Interrupts
                        this._processDamage(targetHit, calculatedDamage);

                        //Generate vigor, if action has no vigor_generated prop, adjust by 0
                        this.actionCharacter.incrementProperty('vigor_points', this.actionTaken.props.vigor_generated);

                        //Build a new message based on the randomTarget
                        setTimeout( () => {
                            this.defaultActionPayload.attachments[0].text = `${this.actionCharacter.props.name}'s *Rounding Kick* connects with ${targetHit.props.name} for ${calculatedDamage} points of damage!
                            \n_${this.actionCharacter.props.name} generates ${this.actionTaken.props.vigor_generated} points of vigor!_`;
                            slack.sendMessage(this.defaultActionPayload);
                        }, 500);

                        return {
                            targetID: targetHit.id,
                            range: this.actionTaken.props.range,
                            damageAmount: calculatedDamage
                        }
                    });

                return {
                    status: 'complete',
                    damageDealt: [{
                        targetID: this.targetCharacter.id,
                        range: this.actionTaken.props.range,
                        damageAmount: this.calculatedDamage
                    }]};

                break;

            default:
                return this._getDefaultProcessResponse();
                break;
        }
    }
}

module.exports = {
    RoundingKick
};