var im = require("immutable");
var utils = require('../common/utils');
var AppDispatcher = require('../dispatchers/AppDispatcher');
var appConstants = require('../constants/appConstants');
var objectAssign = require('react/lib/Object.assign');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');
var metaphone = require('metaphone');
var crypto = require('crypto');



var currentPlayer = im.Map();
var loggedInPlayer = im.Map();
var store = im.List();

var resetStore = function() {
    currentPlayer = new im.Map();
    loggedInPlayer = currentPlayer;
    store = im.List();
};

var getInitialDataFromServer = function (cb) {
    $.ajax({
        dataType: "json",
        method: "get",
        url: window.location.origin + "/api/getCurrentUser",
        timeout: 3000
    }).then(function (data) {
        currentPlayer = new im.Map(data);
        loggedInPlayer = currentPlayer;
        return $.ajax({
            dataType: "json",
            method: "get",
            url: window.location.origin + "/api/getAllPlayers",
            timeout: 3000
        })
    }).then(function (data) {
        store = im.fromJS(data);
        // add metaphone version of name for faster searching
        store = store.map((el) => el.set("metaphone-full" , metaphone(el.get("name"))));
        cb();
    }).fail(function () {
        alert("Initial Player Data Pull Failed. Try again later.")
    })
};

var getOptionList = function(inputValue) {
    var mp = metaphone(inputValue);
    var len = mp.length;
    var ivLen = inputValue.length;
    return store.filter(function(el){
              return mp === el.get('metaphone-full').substring(0, len) ||
               inputValue === el.get('name').substring(0, ivLen);
    })
};


var getCurrentPlayerName = function() {
    return currentPlayer.get('name');
};

var getCurrentPlayer = function() {
    return currentPlayer;
};

var getLoggedInPlayerName = function() {
    return loggedInPlayer.get('name');
};

var updateCurrentPlayer = function (playerName) {
    var newPlayer = store.find((el) => el.get('name') === playerName);
        currentPlayer = newPlayer || im.Map({name: playerName});
        playerStore.emit(appConstants.CHANGE_EVENT);

};

var newPlayer = function (name) {
        $.ajax({
            dataType: "json",
            method: "post",
            contentType: "application/json",
            url: window.location.origin + "/api/newPlayer",
            data: JSON.stringify({name: name}),
            timeout: 3000
        }).then(function (data) {
            currentPlayer = im.fromJS(data);
            addPlayerToStore(data);
            playerStore.emit(appConstants.NEW_PLAYER_EVENT);
        }).fail(function (err) {
            alert("Unable to add player");
        })
};

var addPlayerToStore = function(player) {
    store = store.push(im.fromJS(player).set("metaphone-full" , metaphone(player.name)));
};


AppDispatcher.register(function(payload){
    var action = payload.action;
    switch(action.actionType){
        case appConstants.UPDATE_CURRENT_PLAYER:
            updateCurrentPlayer(action.data);
            break;
        case appConstants.NEW_PLAYER:
            newPlayer(action.data);
            break;
        default:
            return true;
    }
});

var playerStore = objectAssign({}, EventEmitter.prototype, {
    addChangeListener: function (cb) {
        this.on(appConstants.CHANGE_EVENT, cb);
    },
    addNewPlayerListener: function(cb) {
        this.on(appConstants.NEW_PLAYER_EVENT, cb);
    },
    removeNewPlayerListener: function(cb) {
        this.removeListener(appConstants.NEW_PLAYER_EVENT, cb);
    },
    removeChangeListener: function (cb) {
        this.removeListener(appConstants.CHANGE_EVENT, cb);
    },

    getCurrentPlayerName: getCurrentPlayerName,
    getCurrentPlayer: getCurrentPlayer,
    resetStore: resetStore,
    getInitialDataFromServer: getInitialDataFromServer,
    getOptionList: getOptionList,
    store: store
});

module.exports = playerStore;




