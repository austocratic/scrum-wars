'use strict';

//var Firebase = require('../libraries/firebase').Firebase;
//var FirebaseBaseController = require('./FirebaseBaseController').FirebaseBaseController;
//var Slack = require('../libraries/slack').Alert;
//var Item = require('./Item').Item;
//var firebase = new Firebase();

var BaseModel = require('./BaseModel').BaseModel;
var slackTemplates = require('../slackTemplates');

var _ = require('lodash');


class Character extends BaseModel{
    constructor(gameState, characterID){
        super();
        
        var characters = gameState.character;
        
        //Set the character's props
        this.props = characters[characterID];
        this.id = characterID
    }

    purchaseItem(itemObject){

        console.log('Called purchaseItem');

        console.log('character gold: ', this.props.gold);
        console.log('item cost: ', itemObject.props.cost);

        var responseTemplate;

        //Check if the player has sufficient gold
        if (this.props.gold < itemObject.props.cost) {
            //If insufficient gold: return template
            responseTemplate = slackTemplates.insufficientFunds;

            responseTemplate.text = "I'm sorry traveler, you don't have " + itemObject.props.cost + " gold." +
                "\nCan I interest you in something else?";

            return responseTemplate;
        }

        //If sufficient gold:
        //Add item ID to player's inventory
        this.props.inventory.unequipped.push(itemObject.id);
        this.updateProperty('inventory', this.props.inventory);

        //Calculate the player's updated gold
        //Update the characters name property locally
        var updatedPlayerGold = this.props.gold - itemObject.props.cost;
        this.updateProperty('gold', updatedPlayerGold);

        responseTemplate = slackTemplates.purchaseSuccess;

        responseTemplate.text = "_You hand the merchant " + itemObject.props.cost + " in exchange for the " + itemObject.props.name + "_" + "\nThank you for you patronage.  Safe travels, my friend";

        //Return purchase confirmation template
        return responseTemplate;

    }
    
    //Return an array of action IDs that are available this turn (regardless of what zone)
    getActionIDsAvailableThisTurn(currentTurnNumber){

        var characterActionsAvailableInCurrentZone = [];
        
        //Look through all player's actions and determine if any were used in the current turn.
        //Use lodash .find which returns the first occurance of the search parameter.  If it returns any actions that were used on the current turn, then player has no actions available
        if(_.find(this.props.actions, {'turn_used': currentTurnNumber})) {

            //Return an empty array
            return characterActionsAvailableInCurrentZone;
            //return slackTemplates.actionAlreadyTaken;
        }

        return Object.keys(this.props.actions);
    }

    inactivate(){
        this.updateProperty('active', 0);
    }
    
 
    
}



module.exports = {
    Character: Character
};

