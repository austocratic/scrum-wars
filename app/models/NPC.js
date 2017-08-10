var _ = require('lodash');
var BaseModel = require('./BaseModel').BaseModel;


class NPC extends BaseModel{
    constructor(gameState, npcID){
        super();

        var merchants = gameState.npc;

        //Set the character's props
        this.props = merchants[npcID];
        this.id = npcID

    }

    //Returns an array of object IDs
    getItemsForSale(){
        return this.props.for_sale;
    }
}

module.exports = {
    NPC: NPC
};