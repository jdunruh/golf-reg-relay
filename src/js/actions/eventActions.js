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
    },
    movePlayer: function(player) {
        AppDispatcher.handleAction({
            actionType: appConstants.MOVE_PLAYER,
            data: player
        })
    },
    addEvent: function(event){
        AppDispatcher.handleAction({
            actionType: appConstants.ADD_EVENT,
            data: event
        })
    },
    removeEvent: function(event) {
        AppDispatcher.handleACtion({
            actionType: appConstants.REMOVE_EVENT,
            data: event
        })
    }
};

module.exports = eventActions;