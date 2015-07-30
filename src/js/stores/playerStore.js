var im = require("immutable");
var utils = require('../common/utils');
var AppDispatcher = require('../dispatchers/AppDispatcher');
var appConstants = require('../constants/appConstants');
var objectAssign = require('react/lib/Object.assign');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');


var currentPlayer = im.Map();

var resetStore = function() {
    currentPlayer = new im.Map();
};

var getInitialDataFromServer = function () {
    $.ajax({
        dataType: "json",
        method: "get",
        url: window.location.origin + "/api/getCurrentUser",
        timeout: 3000
    }).done(function (data) {
            currentPlayer = new im.Map(data);
        }
    ).fail(function () {
            alert("Initial Data Pull Failed. Try again later.")
        })
};


var getCurrentPlayer = function() {
    return currentPlayer;
};

AppDispatcher.register(function(payload){
    var action = payload.action;
    switch(action.actionType){
        case appConstants.FIND_CURRENT_PLAYER:
            findCurrentPlayer();
            break;
        default:
            return true;
    }
});



module.exports = {
    getCurrentPlayer: getCurrentPlayer,
    resetStore: resetstore
};




