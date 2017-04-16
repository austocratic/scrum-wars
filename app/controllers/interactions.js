

var characterSelectionIndex = require('./../slackTemplates/characterSelectionIndex').characterSelectionIndex;
var characterProfile = require('./../slackTemplates/characterProfile').characterProfile;

//Interactions are follow up responses to messages
//These functions read the type of interaction and control response

exports.interactions = (interactionType) => {
    
    console.log("called interactions function");

    return new Promise((resolve, reject) => {

        var template;

        switch(interactionType){

            case 'characterProfile':

                template = characterProfile();

                resolve(template);
                
                break;
            
            case 'characterSelectionNew':
                
                template = characterSelectionIndex.characterSelectionNew();
                
                resolve(template);

                //Then some database stuff

                break;

            case 'characterSelectionClass':

                template = characterSelectionIndex.characterSelectionClass();

                resolve(template);

                break;

            case 'characterSelectionPicture':

                template = characterSelectionIndex.characterSelectionPicture();

                resolve(template);

                break;

            default:

                //return "ERROR: template not supported"
        }
        
        
    });
    
    


    
    
    
    
    //TODO this may be uneccesary, could be handled by the interaction switch above
    //Returns a interaction template to be used in response to client
    function getTemplate(templateName){

        switch(templateName){

            case 'characterSelectionNew':
                return characterSelectionIndex.characterSelectionNew(payload);
                break;

            case 'characterSelectionClass':
                resolve(characterSelectionIndex.characterSelectionClass(payload));
                break;

            case 'characterSelectionPicture':
                resolve(characterSelectionIndex.characterSelectionPicture(payload));
                break;

            default:

                return "ERROR: template not supported"
        }
    }
};