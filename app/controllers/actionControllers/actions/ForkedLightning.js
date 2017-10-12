
const slack = require('../../../libraries/slack');
const BaseAttack = require('./../baseActions/BaseAttack').BaseAttack;


class ForkedLightning extends BaseAttack {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .9;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 5;
        this.basePower = 5;
        this.baseMitigation = 1;
        this.baseMin = 1;
        this.baseMax = 5;

        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);
        this.calculatedDamageSecondaryTarget = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

        //Alerts & Messages
        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} bolts of arcane energy streak from ${this.actionCharacter.props.name}'s fingers, but ${this.targetCharacter.props.name} resists the bolt's damage!`;
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts to conjure an Arcane Bolt, but the spell fizzles away!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} launches bolts of arcane energy which strike ${this.targetCharacter.props.name} for ${this.calculatedDamage} points of damage!`;

        //Base Slack template
        this.slackPayload = {
            "username": this.actionCharacter.props.name,
            "icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
            "channel": this.slackChannel
        };
    }

    initiate() {
        
        //Process on target with a high chance to hurt
        //If successful, process on second target with half chance to hurt
        //If successful, process on second target with half chance to hurt
        //continue until out of targets or a failure
        
        
        const processOnSingleTarget = (singleTarget, avoidModifier) => {

            console.log('DEBUG processing ForkedLightning on a single target: ', -this.calculatedDamage);

            //If failure, return a failure message and end
            if (this._successCheck(0) === false) {
                console.log('ForkedLightning failed');
                this.slackPayload.text = this.channelActionFailMessage;
                slack.sendMessage(this.slackPayload);
                return false;
            }

            //Evasion check
            //Arguments: accuracyModifier, avoidModifier
            if (this._avoidCheck(0, (0 + avoidModifier)) === false) {
                console.log('ForkedLightning failed (dodge)');
                this.slackPayload.text = this.channelActionAvoidedMessage;
                slack.sendMessage(this.slackPayload);
                return false;
            }
            
            console.log('DEBUG about to change the property by: ', -this.calculatedDamage);

            //Process all the other effects of the action
            this._changeProperty(singleTarget, {hit_points: -this.calculatedDamage});
            
            return true;
        };

        let avoidModifier = 1;
        
        const processOnOtherTargets = () => {
            
            console.log('called processOnOtherTargets, avoidModifier: ', avoidModifier);
            //const randomTarget = game.props.characters;

            if(processOnSingleTarget(this.targetCharacter, avoidModifier) === true) {

                avoidModifier = avoidModifier * 2;
                
                processOnOtherTargets();
            }
        };
        
        //Process on first target
        //If processOnSingleTarget does NOT return a value, continue to process
        if (processOnSingleTarget(this.targetCharacter, 1) === true){
            console.log('keep processing!');

            //Recursive function
            processOnOtherTargets();
        }
    
        
    
        
        
        
        
        
        
        
        /*
        //skill check
        //If failure, return a failure message and end
        if (this._successCheck(0) === false) {
            this.slackPayload.text = this.channelActionFailMessage;
            slack.sendMessage(this.slackPayload);
            return;
        }

        //Evasion check
        //Arguments: accuracyModifier, avoidModifier
        if (this._avoidCheck(0, 0) === false) {
            this.slackPayload.text = this.channelActionAvoidedMessage;
            slack.sendMessage(this.slackPayload);
            return;
        }

        //Process all the other effects of the action
        this._changeProperty(this.targetCharacter, {hit_points: -this.calculatedDamage});

        this.slackPayload.text = this.channelActionSuccessMessage;
        slack.sendMessage(this.slackPayload);*/
        
    }
}


module.exports = {
    ForkedLightning
};