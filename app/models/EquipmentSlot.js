'use strict';

var BaseModel = require('./BaseModel').BaseModel;


class EquipmentSlot extends BaseModel {
    constructor(gameState, equipmentSlotID) {
        super(gameState, 'equipment_slot', equipmentSlotID);

        var equipmentSlots = gameState.equipment_slot;

        //Set the equipment's props
        this.props = equipmentSlots[equipmentSlotID];
        this.id = equipmentSlotID
    }

}


module.exports = {
    EquipmentSlot: EquipmentSlot
};
