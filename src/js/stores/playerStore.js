var im = require("immutable");
var utils = require('../common/utils');
var AppDispatcher = require('../dispatchers/AppDispatcher');
var appConstants = require('../constants/appConstants');
var objectAssign = require('react/lib/Object.assign');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');
var metaphone = require('metaphone');


var currentPlayer = im.Map();
var store = im.List();

var resetStore = function() {
    currentPlayer = new im.Map();
};

var getInitialDataFromServer = function () {
    $.ajax({
        dataType: "json",
        method: "get",
        url: window.location.origin + "/api/getCurrentUser",
        timeout: 3000
    }).then(function (data) {
        currentPlayer = new im.Map(data);
        return $.ajax({
            dataType: "json",
            method: "get",
            url: window.location.origin + "/api/getAllPlayers",
            timeout: 3000
        })
    }).then(function (data) {
        store = im.fromJS(data);
        // add metaphone version of name for faster searching
        store = store.map((el) => el.set("metaphone-full" , metaphone(el.get("name"))))
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

var playerStore = objectAssign({}, EventEmitter.prototype, {
    addChangeListener: function (cb) {
        this.on(appConstants.CHANGE_EVENT, cb);
    },
    removeChangeListener: function (cb) {
        this.removeListener(appConstants.CHANGE_EVENT, cb);
    },

    getCurrentPlayerName: getCurrentPlayerName,
    resetStore: resetStore,
    getInitialDataFromServer: getInitialDataFromServer,
    getOptionList: getOptionList
});

module.exports = playerStore;




