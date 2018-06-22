"use strict";

const _ = require('lodash');
const Action = require('../models/Action').Action;
const validateGameObjects = require('./helpers').validateGameObjects;

const getActionAttachments = gameObjects => {

    validateGameObjects(gameObjects, [
        'game',
        'user',
        'slackResponseTemplate',
        'playerCharacter',
        'requestZone',
        'currentMatch',
        'characterClass'
    ]);

    //Returns an array of all the character's action IDs with is_active = 1
    let actionIDsAvailable = gameObjects.playerCharacter.getActionIDs();

    //Use action IDs to make an array of action objects
    let actionObjectsAvailable = actionIDsAvailable
        .map(eachActionID => {
            return new Action(gameObjects.game.state, eachActionID);
        })
        .filter(eachActionObject => {
            return _.indexOf(eachActionObject.props.zone_id, gameObjects.requestZone.id) > -1;
        });

    //Group the actionControllers for slack (this will add a lodash wrapper)
    let groupedActions = _(actionObjectsAvailable)
        .groupBy(singleAction => {
            return singleAction.props.type;
        });

    let templateAttachments = groupedActions
        .map(actionCategory => {

            //Slack won't display more than 5 buttons in a single attachment.
            //If category has more than 5 elements,

            //An array to hold each action group's attachments.  This will have an additional element for each 5 actions in the group
            let attachmentsForCategory = [];

            //Determine how many attachments are needed for the category.  Each attachment can have 5 buttons
            //Round up to nearest integer to make sure there is room
            let numberOfAttachments = Math.ceil(actionCategory.length / 5);

            //console.log('DEBUG numberOfAttachments: ', numberOfAttachments);

            for (let i = 0; i < numberOfAttachments; i++) {
                attachmentsForCategory.push({
                    "title": actionCategory[0].props.type,
                    "fallback": "You are unable to choose an action",
                    "color": gameObjects.game.menuColor,
                    "attachment_type": "default",
                    "actions": []
                })
            }

            actionCategory.forEach((actionDetails, index) => {

                //Determine which attachment to insert into
                let elementToInsert = Math.floor(index / 5);

                //Default button color to red ("danger").  If available, it will be overwritten
                let actionAvailableButtonColor = "danger";

                let isActionAvailable = gameObjects.playerCharacter.isActionAvailable(actionDetails);

                //if (gameObjects.playerCharacter.isActionAvailable(actionDetails.props.mana_points_cost, actionDetails.props.stamina_points_cost)) {
                if (isActionAvailable.availability) {
                    actionAvailableButtonColor = "primary"
                }

                //Push each action into the actionControllers array portion of the template
                attachmentsForCategory[elementToInsert].actions.push({
                    "name": actionDetails.props.functionName,
                    "text": actionDetails.props.name,
                    //"text": actionDetails.getActionText(gameObjects.playerCharacter),
                    "style": actionAvailableButtonColor,
                    "type": "button",
                    "value": actionDetails.id
                });

                //console.log('DEBUG attachmentsForCategory[elementToInsert]: ', attachmentsForCategory[elementToInsert]);
            });

            //console.log('DEBUG attachmentsForCategory: ', attachmentsForCategory);

            return attachmentsForCategory
        });

    //unwrappedTemplateAttachments is array of arrays, need to flatten:
    function flatten(arr) {
        return arr.reduce(function (flat, toFlatten) {
            return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
        }, []);
    }

    return flatten(templateAttachments.value())

};

module.exports = {
    getActionAttachments
};