'use strict';

const BaseModel = require('./BaseModel').BaseModel;
const slackTemplates = require('../slackTemplates');

const _ = require('lodash');

class Character extends BaseModel{
    constructor(gameState, characterID){
        super(gameState, 'character', characterID);

        let characters = gameState.character;

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
        _.forEach(this.props.stats_current, (value, key) =>{

            this.props.stats_current[key] = this.props.stats_base[key] +
                //If there is a modifier, modify the base otherwise modify by 0
                (()=>{
                    if(modifiers[key]){
                        return modifiers[key]
                    } else {
                        return 0
                    }
                })();
        })
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

        //Calculate the player's updated gold
        //Update the characters name property locally
        var updatedPlayerGold = this.props.gold - itemObject.props.cost;
        this.updateProperty('gold', updatedPlayerGold);

        responseTemplate = {
            "text": "_You successfully purchase the item_"
        };

        responseTemplate.text = "_You hand the merchant " + itemObject.props.cost + " in exchange for the " + itemObject.props.name + "_" + "\nThank you for you patronage.  Safe travels, my friend";

        //Return purchase confirmation template
        return responseTemplate;
    }

    sellItem(itemObject, percentOfCost) {
        console.log('called Character.sellItem()');

        //Look up the item ID in the player's inventory.  If multiple items with the same ID it will find the first and remove it
        let arrayIndex = _.findIndex(this.props.inventory, {'item_id': itemObject.id});

        if (arrayIndex === -1) {
            console.log("ERROR: player attempted to sell an item that was no longer in their inventory");
            return "I'm sorry but it appears that item is no longer in your inventory"
        }

        //Remove the item
        this.props.inventory.splice(arrayIndex, 1);

        //Calculate the player's updated gold
        let updatedPlayerGold = this.props.gold + (itemObject.props.cost * percentOfCost);
        this.updateProperty('gold', updatedPlayerGold);

        return {
            text: `_The merchant hands you ${itemObject.props.cost * percentOfCost} in exchange for your ${itemObject.props.name}_\nThank you for you patronage.  Safe travels, my friend`
        };
    }

    getActionIDs(){

        return this.props.actions
            /*
            .filter( eachAction =>{
                return eachAction.is_available === 1
            })*/
            .map( eachAction =>{
                return eachAction.action_id;
            });
    }
    
    //Return an array of actionIDs that were used on the turnNumber argument
    getActionsUsedOnTurn(turnNumber){

        return this.props.actions
            .filter( eachAction => {
                return eachAction.turn_used === turnNumber
            });
    }

    //Does the player have the same or more mana and stamina points than the cost of the action
    isActionAvailable(manaCost, staminaCost, spiritCost, requirements){

        //What are some other actions that could have different requirements?
        //not stunned
        //frozen
        //Enraged - when below 30% hp, you become enraged

        let actionCheck = {
            availability: true,
            reason: ''
        };

        if (!this.checkMana(manaCost)){
            actionCheck = {
                availability: false,
                reason: 'Insufficient Mana'
            }
        }

        if (!this.checkStamina(staminaCost)){
            actionCheck = {
                availability: false,
                reason: 'Insufficient Stamina'
            }
        }

        if (!this.checkSpirit(spiritCost)){
            actionCheck = {
                availability: false,
                reason: 'Insufficient Spirit'
            }
        }

        if (requirements){
            requirements.forEach(eachRequirement=>{
                if(this.props.stats_current[eachRequirement.key] !== eachRequirement.value){
                    actionCheck.availability = false;
                    actionCheck.reason = eachRequirement.failure_message
                }
            })
        }

        return actionCheck;

        /*
        if(requirements){
            let requirementKeys = Object.keys(requirements);

            requirementKeys.forEach(eachRequirementKey=>{
                if(_.get(this.props, eachRequirementKey) === requirements[eachRequirementKey]){
                    actionCheck = {
                        availability: false
                    }
                }
            });

            requirements.forEach(eachRequirement=>{
                _.get(this.props, eachRequirement)
            })
        }*/

        //What if there are other properties, stats needed to determine if an action is available?

        //For example, backstab is only available if the character is hidden

        //For each action, look at the "requirements" property to see what is required:

        /*Backstab:

        .requirements_to_display: {

        }
        .requirements_to_use: {
            is_hidden: 1
        }
        .requirements_to_use: [
            {
                key: 'is_hidden'
                value: 1
                error: 'You must be hidden to use this skill'
            }
        ]
        .cost: {
            mana: 0
            stamina: 0
            spirit: 0
        }


        */
    }

    checkMana(manaCost){
        return this.props.mana_points >= manaCost;
    }

    checkStamina(staminaCost){
        return this.props.stamina_points >= staminaCost;
    }

    checkSpirit(spiritCost){

        let spiritPoints = (this.props.spirit_points !== undefined) ? this.props.spirit_points : 0;

        return spiritPoints >= spiritCost;
    }

    //Return an array of effects with that contain the modifier searched for
    getEffectsWithModifier(modifierToFind){
        //If character has no effects return empty array
        if (!this.props.effects) {
            return []
        }

        return this.props.effects.filter( eachEffect =>{

            //If the effect does not have modifiers don't include
            if (!eachEffect.modifiers){
                return
            }

            if(eachEffect.modifiers[modifierToFind]){
                //results.push(eachEffect.modifiers[eachModifier])
                return eachEffect.modifiers[modifierToFind]
            }
        });
    }

    //Return an array of items owned by character not equipped
    getUnequippedItems(){

        //If character does not have an inventory property, character does not have any inventory yet.  Return empty array
        if (!this.props.inventory) {
            return [];
        }

        //return items
        return this.props.inventory
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
    //Returns the first equipped item found in that slot.  If no item available return undefined
    getEquipmentInSlot(slotID){

        //Array of equipped item IDs
        let equippedItems = this.getEquippedItems();
        
        //let equippedSlotItem = equippedItems.filter( eachEquippedItem=>{

        return equippedItems.find( eachEquippedItem=>{
            return eachEquippedItem.equipment_slot_id.indexOf(slotID) >= 0
        });
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

    updateActionUsed(actionID, turnNumber){
        console.log('called character.updateActionUsed()');

        let actionKey = _.findKey(this.props.actions, {'action_id': actionID});

        this.props.actions[actionKey].turn_used = turnNumber;
    }

    //Update the character's action's turn_used to 0
    resetActions(){
        console.log('called character.resetActions()');
        this.props.actions.forEach( eachAction => {
            eachAction.turn_used = 0
        })
    }

    updateEffectProcessed(actionID, turnNumber){

        let effectKey = _.findKey(this.props.effects, {'action_id': actionID});

        this.props.effects[effectKey].turn_effect_processed.push(turnNumber)
    }

    inactivate(){
        this.updateProperty('active', 0);
    }
}



module.exports = {
    Character
};

