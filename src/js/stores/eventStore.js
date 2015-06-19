/**
 * Created by jdunruh on 6/14/15.
 */
var im = require("immutable");
var utils = require('../common/utils');

var db;

var resetDB = function() {
    db = new im.Map({organization: "Up the Creek Ski and Rec Club", events: im.List.of()})
};

resetDB();

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

var addEventToDB = function(date, location, flights) {
    db = db.updateIn(["events"], val => val.push(newEvent(date, location, flights)))
};

var addFlightToEvent = function(event, maxPlayers, time, players) {
    players = players || im.List.of();
    db = db.updateIn([events, event, flights], val => val.push(newFilght(maxPlayers, time, players)))
};

var addPlayerToFilght =  function (event, flight, newPlayer) {
            if (!utils.flightFull(db.getIn(["events", event, 'flights', flight]))) {
                db = db.updateIn(["events", event, 'flights', flight, "players"], val => val.add(newPlayer));
            }
        };

var getEventsFromDB = function() {
    return db.get("events");
};

// event is the index in the events list (array) in which tho palyer is to be added
var removePlayerFromEvent = function(event, player) {
    db.getIn(["events", event, "flights"]).map(x => x.get("players").includes(player))
        .forEach((el, key) => db = db.updateIn(["events", event, "flights", key, "players"], val => val.remove(player)));
};

// event is the index in the events list (array) of the event to remove
var removeEventFromDB = function(event) {
    db = db.update("events",
        (coll) => coll.take(event).concat(coll.takeLast(coll.size - event - 1)));
};

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

// recursive function to convort JS structure to immutable as
// in the form needed for this application. The JS structure has
// the form of JSON converted to JS as the result of an HTTP request.
var fromJSCustom1 = function(js, key) {
    console.log(js);
   return typeof js !== 'object' || js === null ? js :
     Array.isArray(js) ?
       fromJSArray(im.Seq(js).map(fromJSCustom1), key) :
       im.Seq(js).map(fromJSCustom1).toMap();
};

module.exports = {
    newFlight: newFlight,
    newEvent: newEvent,
    addEventToDB: addEventToDB,
    addFilghtToEvent: addFlightToEvent,
    addPlayerToFlight: addPlayerToFilght,
    getEventsFromDB: getEventsFromDB,
    resetDB: resetDB,
    removePlayerFromEvent: removePlayerFromEvent,
    removeEventFromDB: removeEventFromDB,
    fromJSCustom: fromJSCustom
};




