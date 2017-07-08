'use strict';

var BaseModel = require('./BaseModel').BaseModel;


class EquipmentSlot extends BaseModel {
    constructor(gameState, equipmentSlotID) {
        super();

        var equipmentSlots = gameState.equipment_slot;

        //Set the character's props
        this.props = equipmentSlots[equipmentSlotID];
        this.id = equipmentSlotID
    }

}


module.exports = {
    EquipmentSlot: EquipmentSlot
};
