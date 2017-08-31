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
    getCumulativeModifiers(propertyReference, filterFunction){
        console.log('called getCumulativeModifiers');

        var cumulativeUpdates = {};

        let characterPropertyReference = this.props[propertyReference];

        //If property reference does not exist on character, return an empty object
        if (characterPropertyReference === undefined) {
            //console.log('Character.getCumulativeModifiers() called with a property reference that does not exist on that character: ', characterPropertyReference)
            return cumulativeUpdates
        }
        
        //console.log('getCumulativeModifiers() characterPropertyReference: ', characterPropertyReference);

        let filteredModifiers = characterPropertyReference.filter(filterFunction);
        
        //console.log('filteredModifiers: ', filteredModifiers);

        filteredModifiers.forEach( eachFilteredModifier=>{

            //console.log('eachFilteredModifier: ', eachFilteredModifier);
            this.accumulateProperties(cumulativeUpdates, eachFilteredModifier.modifiers);
        });

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

        var responseTemplate;

        //Check if the player has sufficient gold
        if (this.props.gold < itemObject.props.cost) {
            //If insufficient gold: return template
            responseTemplate = slackTemplates.insufficientFunds;

            responseTemplate.text = "I'm sorry traveler, you don't have " + itemObject.props.cost + " gold." +
                "\nCan I interest you in something else?";

            return responseTemplate;
        }

        //Properties of an item that will be pushed to the character's inventory
        var item = {
            //Equipment slot will be set at time of equipped
            equipment_slot_id: itemObject.props.equipment_slot_id,
            name: itemObject.props.name,
            is_equipped: 0,
            item_id: itemObject.id,
            modifiers: itemObject.props.modifiers
        };

        //If sufficient gold:
        //Add item ID to player's inventory
        if (this.props.inventory){

            this.props.inventory.push(item);
        } else {
            this.props.inventory = [item]
        }

        //this.updateProperty('inventory', this.props.inventory);

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
    
    //Return an array of items owned by character not equipped
    getUnequippedItems(){

        //If character does not have an inventory property, character does not have any inventory yet.  Return empty array
        if (!this.props.inventory) {
            return [];
        }
        
        let items = this.props.inventory;

        return items
            .filter( eachItem =>{
                return eachItem.is_equipped === 0;
            })
    }

    //Return an array of items owned by character that are equipped
    getEquippedItems(){

        //If character does not have an inventory property, character does not have any inventory yet.  Return empty array
        if (!this.props.inventory) {
            return [];
        }
        
        let items = this.props.inventory;

        return items
            .filter( eachItem =>{
                return eachItem.is_equipped === 1;
            });
    }
    
    //Argument of slot ID
    getEquipmentInSlot(slotID){
        
        let equippedItems = this.getEquippedItems();

        console.log('DEBUG: getEquipmentInSlot(), equippedItems: ', equippedItems);
        
        let equippedSlotItem = equippedItems.filter( eachEquippedItem=>{

            console.log('DEBUG: getEquipmentInSlot(), eachEquippedItem: ', eachEquippedItem);

            return eachEquippedItem.equipment_slot_id.indexOf(slotID) >= 0
        });
        
        console.log('DEBUG: getEquipmentInSlot(), equippedSlotItem: ', equippedSlotItem);
        
        return equippedSlotItem
        
    }

    equipItem(itemObject){

        //find the item in inventory
        var unequippedItem = _.find(this.props.inventory, {'item_id': itemObject.id});

        //Item does not exist
        if (unequippedItem === undefined){
            console.log('ERROR: attempted to equip an item ID that does not exist on that character');
            return {
                text: 'ERROR: attempted to equip an item ID that does not exist on that character'
            }
        }
        
        if (unequippedItem.is_equipped === 1){
            return {
                text: 'That Item is already equipped!'
            }
        }
        unequippedItem.is_equipped = 1;
        //unequippedItem.equipment_slots = itemObject.props.equipment_slots
    }

    unequipItem(itemID){

        //find the item in inventory
        var equippedItem = _.find(this.props.inventory, {'item_id': itemID});

        //Item does not exist
        if (equippedItem === undefined){
            console.log('ERROR: attempted to unequip an item ID that does not exist on that character');
            return {
                text: 'ERROR: attempted to unequip an item ID that does not exist on that character'
            }
        }

        if (equippedItem.is_equipped === 0){
            return {
                test: 'That Item is already unequipped!'
            }
        }

        equippedItem.is_equipped = 0;
    }

    inactivate(){
        this.updateProperty('active', 0);
    }
    
 
    
}



module.exports = {
    Character: Character
};

