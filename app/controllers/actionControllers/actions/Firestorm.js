'use strict';

const slack = require('../../../libraries/slack');
const BaseAction = require('./BaseAction').BaseAction;

class Firestorm extends BaseAction {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 1;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        //AOE Specific attributes
        this.maxTargetsAffected = 5;

        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        //Moving this into process function so it can calculate a new value per target
        //this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

        //Alerts & Messages
        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts to conjure a *fiery storm*, but it fizzles away!`;

    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):
                this.defaultActionPayload.attachments[0].text = `${this.actionCharacter.props.name} begins conjuring a *fiery spell*`;
                this.defaultActionPayload.attachments[0].thumb_url = this.game.baseURL + this.game.thumbImagePath + 'orange-flame.gif';
                slack.sendMessage(this.defaultActionPayload);

                return {
                    status: 'pending',
                    damageDealt: []
                };

                break;
            case (turn <= 1):
                this.defaultActionPayload.attachments[0].text = `Heat ripples throughout the ${this.currentZone.props.name} as ${this.actionCharacter.props.name} continues conjuring a *fiery spell!*`;
                this.defaultActionPayload.attachments[0].thumb_url = this.game.baseURL + this.game.thumbImagePath + 'fire-2.gif';
                slack.sendMessage(this.defaultActionPayload);

                return {
                    status: 'pending',
                    damageDealt: []
                };

                break;
            case (turn <= 2):
                //Build a new message based on the randomTarget
                this.defaultActionPayload.attachments[0].text = `${this.actionCharacter.props.name} unleashes a tempest of fire!`;
                this.defaultActionPayload.attachments[0].thumb_url = this.game.baseURL + this.game.thumbImagePath + 'fire-burst.gif';
                slack.sendMessage(this.defaultActionPayload);

                let targets = this._getUniqueRandomTarget(this.maxTargetsAffected);

                let results = targets
                    .filter( eachTarget =>{

                        //First filter for only attacks that hit, then send avoid messages
                        let avoidCheck = this._avoidCheck(0, 0);

                        if (avoidCheck === false){
                            this.defaultActionPayload.attachments[0].text = `${eachTarget.props.name} evades the the fiery downpour!`;
                            slack.sendMessage(this.defaultActionPayload);
                        }

                        return avoidCheck;
                    })
                    .map(targetHit=>{

                        let calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

                        //Process damage & Interrupts
                        this._processDamage(targetHit, calculatedDamage);

                        //Build a new message based on the randomTarget
                        setTimeout( () => {
                            this.defaultActionPayload.attachments[0].text = `${this.actionCharacter.props.name}'s *fire storm* rains down, scorching ${targetHit.props.name} for ${calculatedDamage} points of damage!`;
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
                    damageDealt: results
                };

                /*
                const processOnSingleTarget = (singleTarget) => {

                    //Evasion check
                    //Arguments: accuracyModifier, avoidModifier
                    if (this._avoidCheck(0, 0) === false) {
                        this.defaultActionPayload.attachments[0].text = `${singleTarget.props.name} evades the the fiery downpour!`;
                        slack.sendMessage(this.defaultActionPayload);
                        return;
                    }

                    let calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

                    //Process damage & Interrupts
                    this._processDamage(singleTarget, calculatedDamage);

                    //Build a new message based on the randomTarget
                    setTimeout( () => {
                        this.defaultActionPayload.attachments[0].text = `${this.actionCharacter.props.name}'s *fire storm* rains down, scorching ${singleTarget.props.name} for ${calculatedDamage} points of damage!`;
                        slack.sendMessage(this.defaultActionPayload);
                    }, 500);

                };

                //Iterate through targets processing
                for(const target of targets){
                    console.log('keep processing!');

                    //let result = processOnSingleTarget(target, 1);
                    let result = processOnSingleTarget(target, 1);
                }*/

                break;
            default:
                this._deleteActionInQueue();
                break;
        }
    }


}

/* Structure to add additional property validations
 QuickStrike.validations = [
 ...BaseAttack.validations,
 'playerCharacter',
 'targetCharacter',
 'requestZone',
 'currentMatch',
 'actionTaken'
 ];*/


module.exports = {
    Firestorm
};