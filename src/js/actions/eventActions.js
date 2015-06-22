var AppDispatcher = require('../dispatchers/AppDispatcher');
var appConstants = require('../constants/appConstants');

var eventActions = {
    addPlayer: function(player){
        AppDispatcher.handleAction({
            actionType: appConstants.ADD_PLAYER,
            data: player
        });
    },
    removePlayer: function(player){
        AppDispatcher.handleAction({
            actionType: appConstants.REMOVE_PLAYER,
            data: player
        })
    }
};

module.exports = eventActions;