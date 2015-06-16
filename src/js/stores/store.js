/**
 * Created by jdunruh on 6/14/15.
 */
var im = require("immutable");
var utils = require('./utils');

var db = new im.Map;

var newFilght = function(players) {
        return (im.Map({
            maxPlayers: maxPlayers, players: players, position: position, time: time
        }))
};

var addPlayerToFilght =  function (flight, newPlayer) {
            if (!utils.flightFull(flight)) {
                flight.players.add(newPlayer);
            }
        };


function newEvent(organization, name, location, flights) {
    return im.Map({organization: organization,
        eventName: name,
        location: location,
        flights: flights});
}




