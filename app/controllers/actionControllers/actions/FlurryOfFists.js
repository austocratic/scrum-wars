'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

class FlurryOfFists extends BaseAction {
    constructor(gameObjects, actionCharacter) {
        super(gameObjects, actionCharacter);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;

        this.bonusDamage = this.actionCharacter.props.level;
        this.calculatedDamage = this._calculateMelee(this.actionTaken.props.damage_multiplier, this.bonusDamage);
        console.log(`${this.actionTaken.props.name} calculated damage of: ${this.calculatedDamage}`);

        this.channelActionFailMessage = `${this.actionCharacter.props.name}'s *Flurry of Fists* strike out, but stumbles!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} strikes with a *Flurry of Fists* but ${this.targetCharacter.props.name} blocks the blow!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} fists become a blur, striking ${this.targetCharacter.props.name} for ${this.calculatedDamage} points of damage!
        \n_${this.actionCharacter.props.name} generates ${this.actionTaken.props.vigor_generated} points of vigor!_`;
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        switch (true) {
            case (turn <= 0):
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

                this.defaultActionPayload.attachments[0].text = this.channelActionSuccessMessage;
                slack.sendMessage(this.defaultActionPayload);

                //Process damage & Interrupts
                this._processDamage(this.targetCharacter, this.calculatedDamage);

                //Generate vigor, if action has no vigor_generated prop, adjust by 0
                this.actionCharacter.incrementProperty('vigor_points', this.actionTaken.props.vigor_generated);

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
    FlurryOfFists
};