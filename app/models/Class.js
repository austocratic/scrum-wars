const BaseModel = require('./BaseModel').BaseModel;
const Action = require('./Action').Action;


class Class extends BaseModel{
    constructor(gameState, classID){
        super(gameState, 'class', classID);

        var classes = gameState.class;

        //Set the character's props
        this.props = classes[classID];
        this.id = classID
    }

    getDetailView(){

        //TODO not good to hardcode the url path here.  Elsewhere I use the game.baseURL property, but Item does not have access to game (ony game.state)
        let template = {
            "attachments": [
                {
                    //"image_url": `https://scrum-wars.herokuapp.com/public/images/${this.props.icon_name}.png`,
                    "title": "Starting stats",
                    "fallback": "",
                    "fields": [
                        {
                            "title": this.props.name,
                            "short": false
                        }
                    ]
                }
            ]
        };

        //Iterate through the object adding properties to the template
        for (let starting_attributes in this.props.starting_attributes) {

            template.attachments[0].fields.push({
                "title": starting_attributes,
                "value": `${this.props.starting_attributes[starting_attributes]}`,
                "short": true
            });
        }



        return template;
    };
}



module.exports = {
    Class
};

