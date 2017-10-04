'use strict';

const slack = require('../../../libraries/slack');
const BaseActionEffect = require('../BaseActionEffect').BaseActionEffect;


class DamageOverTime extends BaseActionEffect{
    constructor(gameObjects) {
        super(gameObjects);

        //TODO do I need an actionCharacter?

        //this.calculatedDamage = this._calculateDamage(this.calculatedPower, this.calculatedMitigation);
        this.calculatedDamage = 3;

        this.iconFileName = "";

        this.channelActionSuccessMessage = `${this.targetCharacter.props.name} reels in pain from poison taking ${this.calculatedDamage} damage!`;
        //this.channelActionSuccessMessage = `${this.actionCharacter.props.name} launches bolts of arcane energy which strike ${this.targetCharacter.props.name} for ${this.calculatedDamage} points of damage!`;

        //Base Slack template
        this.slackPayload = {
            "username": this.actionCharacter.props.name,
            "icon_url": this.game.baseURL + this.game.avatarPath + this.actionCharacter.props.gender + '/' + this.actionCharacter.props.avatar,
            //"username": 'DOT_Name',
            //"icon_url": 'http://icons.iconarchive.com/icons/graphicloads/100-flat/256/home-icon.png',
            "channel": ("#" + gameObjects.currentZone.props.channel),
            "attachments": [{
                "text": this.channelActionSuccessMessage,
                "thumb_url": this.game.baseURL + this.game.skillImagePath + '67.png'
            }]
        };
    }

    initiate() {

        console.log('DEBUG called DamageOverTime.initiate()');

        console.log('DEBUG DamageOverTime initiate() health before: ', this.targetCharacter.hit_points);

        //Process all the other effects of the action
        this._changeProperty(this.targetCharacter, {hit_points: -this.calculatedDamage});

        console.log('DEBUG just changed the property');

        //Send slack notification
        //this.slackPayload.text = this.channelActionSuccessMessage;

        console.log('DEBUG calling slack alert, ', JSON.stringify(this.slackPayload));

        slack.sendMessage(this.slackPayload);
    }


}



//Attach validations
/*
DamageOverTime.validations = [
    'game'
];*/

module.exports = {
    DamageOverTime
};