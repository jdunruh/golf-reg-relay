var AppDispatcher = require('../dispatchers/AppDispatcher');
var appConstants = require('../constants/appConstants');

var eventActions = {
    updateOrg: function(player) {
        AppDispatcher.handleAction({
            actionType: appConstants.UPDATE_ORG,
            data: player
        })
    },
    addOrg: function(event){
        AppDispatcher.handleAction({
            actionType: appConstants.ADD_ORG,
            data: event
        })
    },
    removeOrg: function(event) {
        AppDispatcher.handleACtion({
            actionType: appConstants.REMOVE_ORG,
            data: event
        })
    }
};

module.exports = eventActions;