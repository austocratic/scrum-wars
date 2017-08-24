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
            //equipment_slot_id: itemObject.props.slot,
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
    
    getUnequippedItems(){

        var items = this.props.inventory;

        return items
            .filter( eachItem =>{
                return eachItem.is_equipped === 0;
            })
    }

    getEquippedItems(){
        
        var items = this.props.inventory;

        return items
            .filter( eachItem =>{
                return eachItem.is_equipped === 1;
            });
        
        //Get the equipment slots from the DB - we will display an equipment slot
    }

    getEquipmentList(equipmentIDArray){

        //DB has an equipment_slots array
        var equipmentSlots = this.state.equipment_slot;

        //console.log('equipmentSlots: ', JSON.stringify(equipmentSlots));

        var slotKeys = Object.keys(equipmentSlots);

        //For each equipment slot determine what item the player has in that slot and return
        return slotKeys.map( eachEquipmentSlotID=>{

            var eachEquipmentSlot = equipmentSlots[eachEquipmentSlotID];

            //console.log('eachEquipmentSlot: ', eachEquipmentSlot);

            //Declare a local equipment slot
            var localEquipmentSlot = new EquipmentSlot(this.state, eachEquipmentSlotID);

            //console.log('localEquipmentSlot id: ', localEquipmentSlot.id);
            //default, will get overwritten
            var itemInSlot = undefined;

            //Iterate through equipmentList to determine if there is an equipped item in that slot
            equipmentIDArray.forEach( eachEquipmentID =>{

                //console.log('eachEquipmentID: ', eachEquipmentID);

                //Create a local item
                var localItem = new Item(this.state, eachEquipmentID);

                //console.log('localItem: ', localItem);

                //console.log('localItem props: ', localItem.props.equipment_slots);

                //console.log('localEquipmentSlotid: ', localEquipmentSlot.id);


                var itemIndex = localItem.props.equipment_slots.indexOf(localEquipmentSlot.id);

                if (itemIndex >= 0) {
                    itemInSlot = localItem
                }
            });

            //If no item in slot (undefined), set the item to the "empty" item
            if (typeof itemInSlot == 'undefined') {
                itemInSlot = new Item(this.state, emptyItemID);
            }

            //console.log('itemInSlot: ', itemInSlot);

            var baseTemplate = {
                "title": localEquipmentSlot.props.name,
                "callback_id": "equipmentMenu",
                "thumb_url": "https://scrum-wars.herokuapp.com/assets/thumb/" + itemInSlot.id + ".jpg",
                "fields": [{
                    "title": "Equipment name",
                    "value": itemInSlot.props.name,
                    "short": false
                }],
                "actions": []
            };

            console.log('itemInSlot.id: ', itemInSlot.id);
            console.log('emptyItemID: ', emptyItemID);

            //If the item is any ID other than the "empty" item, add an inspect button
            if (itemInSlot.id != emptyItemID) {

                console.log('Passed conditional pushing to baseTemplate.action: ', JSON.stringify(baseTemplate.actions));

                baseTemplate.actions.push({
                    "name": "inspect",
                    "text": "Inspect item",
                    "style": "default",
                    "type": "button",
                    "value": itemInSlot.id
                })
            }

            return baseTemplate
        });
    }

    inactivate(){
        this.updateProperty('active', 0);
    }
    
 
    
}



module.exports = {
    Character: Character
};

