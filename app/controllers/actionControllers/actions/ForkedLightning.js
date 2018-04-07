'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

class ForkedLightning extends BaseAction {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        //AOE Specific attributes
        this.maxTargetsAffected = 5;

        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        //this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);
        //this.calculatedDamageSecondaryTarget = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

        //Alerts & Messages
        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionAvoidedMessage = `Bolts of arcane energy streak from ${this.actionCharacter.props.name}'s fingers, but ${this.targetCharacter.props.name} resists the bolt's damage!`;
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts to conjure an Arcane Bolt, but the spell fizzles away!`;
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):
                this.defaultActionPayload.attachments[0].text = `*Lightning swirls* as ${this.actionCharacter.props.name} begins to conjure a spell!`;
                this.defaultActionPayload.attachments[0].thumb_url = this.game.baseURL + this.game.thumbImagePath + 'lightning-ball.gif';
                slack.sendMessage(this.defaultActionPayload);

                return {
                    status: 'pending',
                    damageDealt: []
                };

                break;
            case (turn <= 1):
                let targets = this._getUniqueRandomTarget(this.maxTargetsAffected);

                //Filter out the originally targeted character (it will be added again as first element)
                targets = targets.filter( eachTarget =>{
                    return eachTarget.id !== this.targetCharacter.id
                });

                //Push the original target into the targets array (must be first position!)
                targets.unshift(this.targetCharacter);

                //Value will increase with each iteration
                let avoidModifier = 1;

                const processOnSingleTarget = (singleTarget, modifier) => {
                    console.log('Called processOnSingleTarget');

                    //Evasion check
                    //Arguments: accuracyModifier, avoidModifier
                    if (this._avoidCheck(0, (0 + modifier)) === false) {
                        console.log('ForkedLightning failed (dodge)');
                        this.defaultActionPayload.attachments[0].text = this.channelActionAvoidedMessage;
                        slack.sendMessage(this.defaultActionPayload);
                        return false;
                    }

                    let calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

                    //Process damage & Interrupts
                    this._processDamage(singleTarget, calculatedDamage);

                    //Build a new message based on the randomTarget
                    setTimeout( () => {
                        this.defaultActionPayload.attachments[0].text = `${this.actionCharacter.props.name}'s bolts of *arcane energy* strike ${singleTarget.props.name} for ${calculatedDamage} points of damage!`;
                        this.defaultActionPayload.attachments[0].thumb_url = this.game.baseURL + this.game.thumbImagePath + 'yellow-lightning-circle.gif';
                        slack.sendMessage(this.defaultActionPayload);
                    }, 500);

                    //Each time a character is damaged add it to the response
                    response.damageDealt.push({
                        targetID: singleTarget.id,
                        range: this.actionTaken.props.range,
                        damageAmount: calculatedDamage
                    });

                    return true;
                };

                //UPDATING:
                //When action fails, break and return.  Try .some array function
                let response = {
                    status: 'complete',
                    damageDealt: []
                };

                //Iterate through targets processing, if one fails, stop
                for(const target of targets){
                    console.log('keep processing!');

                    let result = processOnSingleTarget(target, avoidModifier);

                    if(result === false){
                        break
                    }

                    //Increase the avoidModifier to make each successful process more difficult
                    avoidModifier = avoidModifier * 2;

                    //Alert the channel of the action
                    slack.sendMessage(this.defaultActionPayload);
                }

                return response;

                break;
            default:
                this._deleteActionInQueue();
                break;
        }
    }
}


module.exports = {
    ForkedLightning
};