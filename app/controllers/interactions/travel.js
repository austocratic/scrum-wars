"use strict";

var Slack = require('../../libraries/slack').Alert;

var Character = require('../../models/Character').Character;
var Zone = require('../../models/Zone').Zone;

//TODO need to make the travel function into a reusable function.  See moveCharacter function in resolveActions function
exports.travel = payload => {

    return new Promise((resolve, reject) =>{

        //Get the slack user ID who made the selection
        var userID = payload.user_id;
        var channelID = payload.channel_id;
        
        var localZone = new Zone();

        localZone.setByProperty('channel_id', channelID)
            .then(()=>{
                var localCharacter = new Character();

                localCharacter.setByProperty('user_id', userID)
                    .then(()=>{
                        localCharacter.updateProperty("zone_id", localZone.props.id)
                            .then(()=>{
                                var travelAlertDetails = {
                                    "username": "A mysterious voice",
                                    "icon_url": "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/green-grunge-clipart-icons-animals/012979-green-grunge-clipart-icon-animals-animal-dragon3-sc28.png",
                                    "channel": ("#" + localZone.props.channel),
                                    "text": (localCharacter.props.name + ' has entered ' + localZone.props.name)
                                };

                                //Create a new slack alert object
                                var travelAlert = new Slack(travelAlertDetails);

                                //Send alert to slack
                                travelAlert.sendToSlack(this.params)
                                    .then(() =>{
                                        console.log('Successfully posted to slack')
                                    })
                                    .catch(error =>{
                                        console.log('Error when sending to slack: ', error)
                                    });

                                //Resolve regardless of sendToSlack result
                                resolve();
                            })
                    });
            });
    });
};