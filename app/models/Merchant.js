var _ = require('lodash');
var BaseModel = require('./BaseModel').BaseModel;


class Merchant extends BaseModel{
    constructor(gameState, merchantID){
        super();

        var merchants = gameState.merchant;

        //Set the character's props
        this.props = merchants[merchantID];
        this.id = merchantID

    }

    //Returns an array of object IDs
    getItemsForSale(){
        return this.props.for_sale;
    }
}

module.exports = {
    Merchant: Merchant
};