
const slack = require('../../../libraries/slack');
const BaseAttack = require('./../baseActions/BaseAttack').BaseAttack;


class Firestorm extends BaseAttack {
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
        this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);

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
                this.slackPayload.attachments[0].text = `${this.actionCharacter.props.name} begins conjuring a *fiery spell*`;
                this.slackPayload.attachments[0].thumb_url = this.game.baseURL + this.game.imagePath + 'orange-flame.gif';
                slack.sendMessage(this.slackPayload);
                break;
            case (turn <= 1):
                this.slackPayload.attachments[0].text = `Heat ripples throughout the ${this.currentZone.props.name} as ${this.actionCharacter.props.name} continues conjuring a *fiery spell!*`;
                this.slackPayload.attachments[0].thumb_url = this.game.baseURL + this.game.imagePath + 'fire-2.gif';

                console.log('DEBUG Firestorm 1 slack payload: ', JSON.stringify(this.slackPayload));

                slack.sendMessage(this.slackPayload);
                break;
            case (turn <= 2):
                //Build a new message based on the randomTarget
                this.slackPayload.attachments[0].text = `${this.actionCharacter.props.name} unleashes a tempest of fire!`;
                //this.slackPayload.attachments[0].thumb_url = this.game.baseURL + this.game.imagePath + 'fire-burst.gif';
                slack.sendMessage(this.slackPayload);

                let targets = this._getUniqueRandomTarget(this.maxTargetsAffected);

                //console.log('DEBUG Firestorm targets to process: ', targets);

                const processOnSingleTarget = (singleTarget) => {

                    //Evasion check
                    //Arguments: accuracyModifier, avoidModifier
                    if (this._avoidCheck(0, 0) === false) {
                        this.slackPayload.text = `${singleTarget.props.name} evades the the fiery downpour!`;
                        slack.sendMessage(this.slackPayload);
                        return;
                    }

                    //Process damage & Interrupts
                    this._processDamage();

                    //Build a new message based on the randomTarget
                    setTimeout( () => {
                        this.slackPayload.text = `${this.actionCharacter.props.name}'s *fire storm* rains down, scorching ${singleTarget.props.name} for ${this.calculatedDamage} points of damage!`;
                        slack.sendMessage(this.slackPayload);
                    }, 500);

                };

                //Iterate through targets processing
                for(const target of targets){
                    console.log('keep processing!');

                    //let result = processOnSingleTarget(target, 1);
                    let result = processOnSingleTarget(target, 1);

                    /*
                    if(result === false){
                        break
                    }*/

                    //Alert the channel of the action
                    this.slackPayload.attachments[0].text = this.channelActionSuccessMessage;
                    slack.sendMessage(this.slackPayload);
                }

                break;
            case (turn >= 3):
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