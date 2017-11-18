
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

        //AOE Specific attributes
        this.maxTargetsAffected = 5;

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

    initiate(){
        console.log('Called ForkedLightning.initiate()');

        return this._initiateAction();
    }

    process(turn) {
        console.log('called ForkedLightning.process on turn: ', turn);

        switch (true) {
            case (turn <= 0):
                this.slackPayload.text = `*Lightning swirls* as ${this.actionCharacter.props.name} begins to conjure a spell!`;
                slack.sendMessage(this.slackPayload);
                break;
            case (turn <= 1):
                let targets = this._getUniqueRandomTarget(this.maxTargetsAffected);

                //Value will increase with each iteration
                let avoidModifier = 1;

                const processOnSingleTarget = (singleTarget, avoidModifier) => {
                    console.log('Called processOnSingleTarget');

                    //Evasion check
                    //Arguments: accuracyModifier, avoidModifier
                    if (this._avoidCheck(0, (0 + avoidModifier)) === false) {
                        console.log('ForkedLightning failed (dodge)');
                        this.slackPayload.text = this.channelActionAvoidedMessage;
                        slack.sendMessage(this.slackPayload);
                        return false;
                    }

                    //Process all the other effects of the action
                    singleTarget.incrementProperty('health', -this.calculatedDamage);

                    return true;
                };

                //Iterate through targets processing, if one fails, stop
                for(const target of targets){
                    console.log('keep processing!');

                    let result = processOnSingleTarget(target, 1);

                    if(result === false){
                        break
                    }

                    avoidModifier = avoidModifier * 2;

                    //Alert the channel of the action
                    this.slackPayload.text = this.channelActionSuccessMessage;
                    slack.sendMessage(this.slackPayload);
                }
                break;
            case (turn >= 2):
                this._deleteActionInQueue();
                break;
        }
    }
}


module.exports = {
    ForkedLightning
};