var im = require("immutable");
var utils = require('../common/utils');
var AppDispatcher = require('../dispatchers/AppDispatcher');
var appConstants = require('../constants/appConstants');
var objectAssign = require('react/lib/Object.assign');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');


var store = new im.Map({});

// A little syntactic sugar to fill in the second arg needed
// in the recursive function on the first call for the user
var fromJSCustom = function(js) {
    return fromJSCustom1(js, null)
};

// players are represented as a Set, other JSON arrays represent Lists
// expects to get JS converted to immutable Seq from fromJNCustom1
var fromJSArray = function(js, key) {
    return key === "players" ? js.toSet() : js.toList();
};

// recursive function to convert JS structure to immutable as
// in the form needed for this application. The JS structure has
// the form of JSON converted to JS as the result of an HTTP request.
var fromJSCustom1 = function(js, key) {
    return typeof js !== 'object' || js === null ? js :
        Array.isArray(js) ?
            fromJSArray(im.Seq(js).map(fromJSCustom1), key) :
            im.Seq(js).map(fromJSCustom1).toMap();
};

var resetStore = function() {
    store = new im.Map({organization: "Up the Creek Ski and Rec Club", events: im.List.of()})
};

var getInitialDataFromServer = function (cb) {
    $.ajax({
        dataType: "json",
        method: "get",
        url: window.location.origin + "/api/getAllEvents",
        timeout: 3000
    }).done(function (data) {
            store = new im.Map({organization: "Up the Creek Ski and Rec Club", events: fromJSCustom(data)});
            cb();
        }
    ).fail(function () {
            alert("Initial Data Pull Failed. Try again later.")
        })
};



var newFlight = function(maxPlayers, time, players) {
        players = players || im.Set([]);
        return (im.Map({
            maxPlayers: maxPlayers, players: players, time: time
        }))
};

var newEvent = function(date, location, flights) {
    flights = flights || im.List.of();
    return (im.Map({
        date: date, location: location, flights: flights
    }))
};

var addEventToStore = function(date, location, flights) {
    store = store.updateIn(["events"], val => val.push(newEvent(date, location, flights)))
};

var addFlightToEvent = function(event, maxPlayers, time, players) {
    players = players || im.List.of();
    store = store.updateIn([events, event, flights], val => val.push(newFilght(maxPlayers, time, players)))
};

var addPlayer = function(event, flight, player) {
    $.ajax({
        dataType: "json",
        method: "put",
        url: window.location.origin + "/api/addPlayer",
        data: JSON.stringify({event: store.getIn(["events", event, "_id"]), flight: flight, player: player}),
        timeout: 3000
    }).done(function (data) {
        addPlayerToFlight(event, flight, player);
        eventStore.emit(appConstants.CHANGE_EVENT); // note this must be here so that the emit happens after the update
    }).fail(function () {
        alert("Unable to update server. Try again later.")
    });
};


var addPlayerToFlight =  function (event, flight, newPlayer) {
            if (!utils.flightFull(store.getIn(["events", event, 'flights', flight]))) {
                store = store.updateIn(["events", event, 'flights', flight, "players"], val => val.add(newPlayer));
            }
        };

var getEventsFromStore = function() {
    return store.get("events", null);
};

// event is the index in the events list (array) in which tho palyer is to be added
var removePlayerFromEvent = function(event, player) {
    store.getIn(["events", event, "flights"]).map(x => x.get("players").includes(player))
        .forEach((el, key) => store = store.updateIn(["events", event, "flights", key, "players"], val => val.remove(player)))};



var removePlayer = function(event, player) {
    var flight  = store.getIn(["events", 0, "flights"]).findEntry(x => x.get("players").includes(player))
    $.ajax({
        dataType: "json",
        method: "delete",
        url: window.location.origin + "/api/removePlayer",
        timeout: 3000,
        data: JSON.stringify({event: store.getIn(["events", event, "_id"]), player: player, flight: flight[0]}),
    }).done(function (data) {
        removePlayerFromEvent(event, player);
        eventStore.emit(appConstants.CHANGE_EVENT); // note this must be here to ensure that the emit is after the server update
    }).fail(function () {
        alert("Unable to update server. Try again later.")
    });
};

// event is the index in the events list (array) of the event to remove
var removeEventFromStore = function(event) {
    store = store.update("events",
        (coll) => coll.take(event).concat(coll.takeLast(coll.size - event - 1)));
};

var movePlayer = function(event, player, toFlight) {
    var flight  = store.getIn(["events", 0, "flights"]).findEntry(x => x.get("players").includes(player))
    $.ajax({
        dataType: "json",
        method: "patch",
        url: window.location.origin + "/api/movePlayer",
        timeout: 3000,
        data: JSON.stringify({event: store.getIn(["events", event, "_id"]), player: player, fromFlight: flight[0], toFlight: toFlight}),
    }).done(function (data) {
        movePlayerToFlight(event, player, toFlight);
        eventStore.emit(appConstants.CHANGE_EVENT); // note this must be here to ensure that the emit is after the server update
    }).fail(function () {
        alert("Unable to update server. Try again later.")
    });
};

// move a player from an existing flight to a new flight
var movePlayerToFlight = function(event, player, flight) {
    if(!utils.flightFull(store.getIn(["events", 0, "flights", flight]))) {
        removePlayerFromEvent(event, player);
        addPlayerToFlight(event, flight, player);
    }
};

var eventStore = objectAssign({}, EventEmitter.prototype, {
    addChangeListener: function(cb){
        this.on(appConstants.CHANGE_EVENT, cb);
    },
    removeChangeListener: function(cb){
        this.removeListener(appConstants.CHANGE_EVENT, cb);
    },
    newFlight: newFlight,
    newEvent: newEvent,
    addEventToStore: addEventToStore,
    addFlightToEvent: addFlightToEvent,
    addPlayerToFlight: addPlayerToFlight,
    getEventsFromStore: getEventsFromStore,
    resetStore: resetStore,
    removePlayerFromEvent: removePlayerFromEvent,
    removeEventFromStore: removeEventFromStore,
    fromJSCustom: fromJSCustom,
    movePlayerToFlight: movePlayerToFlight,
    getInitialDataFromServer: getInitialDataFromServer
});

AppDispatcher.register(function(payload){
    var action = payload.action;
    switch(action.actionType){
        case appConstants.ADD_PLAYER:
            addPlayer(action.data.event, action.data.flight, action.data.player)
            break;
        case appConstants.REMOVE_PLAYER:
            removePlayer(action.data.event, action.data.player);
            break;
        case appConstants.MOVE_PLAYER:
            movePlayer(action.data.event, action.data.player, action.data.flight);
            break;
        default:
            return true;
    }
});



module.exports = eventStore;




