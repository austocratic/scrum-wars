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

    //Get an object with an accumulation of modifiers based on the propertyReference passed in
    getCumulativeModifiers(propertyReference, matchTurn){
        console.log('called getCumulativeModifiers');

        console.log('propertyReference: ', propertyReference);

        var cumulativeUpdates = {};
        
        this.props[propertyReference].forEach( eachEffect =>{

            console.log('cumulativeUpdates: ', cumulativeUpdates);

            //If the effect has an end turn, verify that it is not expired before adding
            if (eachEffect.end_turn){
                if (eachEffect.end_turn > matchTurn) {
                    this.accumulateProperties(cumulativeUpdates, eachEffect.modifiers);
                }
            //If effect does not have an end turn, add it
            } else {
                this.accumulateProperties(cumulativeUpdates, eachEffect.modifiers);
            }
        });
        
        console.log('cumulative updates: ', cumulativeUpdates);
        return cumulativeUpdates;
    }

    setModifiedStats(modifiers){

        //Get the keys of the update object
        var updateKeys = Object.keys(modifiers);

        var baseAttribute, modifiedAttribute;
        
        //For each key, update the local character by adding that value plus the base attribute
        updateKeys.forEach( eachUpdateKey =>{

            //Parse the update key into two parts to get the base (I.E: modified_strength --> strength)
            baseAttribute = eachUpdateKey.split("_")[1];

            //Add base attribute to modified attribute
            modifiedAttribute = modifiers[eachUpdateKey] + this.props[baseAttribute];
            
            this.updateProperty(eachUpdateKey, modifiedAttribute);

        });
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

    getActionIDs(){

        var filteredActions = this.props.actions.filter( eachAction =>{
            return eachAction.is_available === 1
        });

        return filteredActions.map( eachAction =>{
            return eachAction.action_id;
        });
    }
    
    //Return an array of actionIDs that were used on the turnNumber argument
    getActionsUsedOnTurn(turnNumber){

        var actionIDs = this.getActionIDs();
        
        return actionIDs.filter( eachActionID =>{

            var foundAction = _.find(this.props.actions, {'action_id': eachActionID});

            return foundAction.turn_used === turnNumber
        })
        
    }

    //Checks to see if the action ID passed as an argument is available on the turn passed as an argument
    isActionAvailable(actionID, turnNumber){

        var foundAction = _.find(this.props.actions, {'action_id': actionID});

        if (foundAction.turn_available <= turnNumber) {
            return true;
        }
        
        //Else return false
        return false;
    }

    inactivate(){
        this.updateProperty('active', 0);
    }
    
 
    
}



module.exports = {
    Character: Character
};

