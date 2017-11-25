
const slack = require('../../../libraries/slack');
const BaseAttack = require('./../baseActions/BaseAttack').BaseAttack;


class Backstab extends BaseAttack {
    constructor(gameObjects) {
        super(gameObjects);

        this.baseSuccessChance = .8;
        this.baseAccuracyScore = 10;
        this.baseAvoidScore = 2;
        this.basePower = 10;
        this.baseMitigation = 1;
        this.baseMin = 3;
        this.baseMax = 8;

        this.calculatedPower = this._calculateStrength(this.basePower, 0, this.baseMin, this.baseMax);
        this.calculatedMitigation = this._calculateStrength(this.baseMitigation, 0, 0, 0);
        this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);
        
        this.playerActionFailedMessage = "Your attack fails!";
        this.playerActionAvoidedMessage = "Your target avoids your attack!";
        this.channelActionFailMessage = `${this.actionCharacter.props.name} attempts a Quick Strike, but stumbles!`;
        this.channelActionAvoidedMessage = `${this.actionCharacter.props.name} lunges forward for a Quick Strike but ${this.targetCharacter.props.name} evades the attack!`;
        this.channelActionSuccessMessage = `${this.actionCharacter.props.name} emerges from the shadows and backstabs ${this.targetCharacter.props.name} for ${this.calculatedDamage} points of damage!`;
    }

    initiate(){
        console.log(`Called ${this.actionTaken.props.name}.initiate()`);
        return this._initiateAction();
    }

    process(turn) {
        console.log(`called ${this.actionTaken.props.name}.process on turn: ${turn}`);

        switch (true) {
            case (turn <= 0):
                if (this._avoidCheck(0, 0) === false) {
                    this.slackPayload.attachments[0].text = this.channelActionAvoidedMessage;
                    slack.sendMessage(this.slackPayload);
                    return;
                }

                this.slackPayload.attachments[0].text = this.channelActionSuccessMessage;
                slack.sendMessage(this.slackPayload);

                //Process damage & Interrupts
                this._processDamage();

                //Find all currently applied effects that change the targets is_hidden property
                if (this.actionCharacter.props.effects) {
                    this.actionCharacter.props.effects
                        .filter(eachEffect => {
                            return eachEffect.modifiers.modified_is_hidden === 1
                        })
                        .forEach(eachEffect => {
                            this._reverseEffect(this.actionCharacter, eachEffect.action_id);
                        });
                }
                break;
            case (turn >= 1):
                this._deleteActionInQueue();
                break;
        }
    }

}


module.exports = {
    Backstab
};