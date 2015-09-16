var im = require('immutable');

// apply or across an array of boolean values. Good for summarizing map()s generating boolean results
var orFn = array => array.reduce((el, acc) => el || acc);

var inTeeList = (event, player) =>
    orFn(event.get("flights").map(x => x.get("players").some(el => el.get('name') === player.get('name'))));


var flightFull = flight => flight.get("players").size >= flight.get("maxPlayers");

var availableFlights = event => event.filter(f => !flightFull(f));

var playerInFlight = (flight, player) => flight.get("players").some(el => el.get('name') === player.get('name'));


var findTimes = function(event, player) {
    return event.get("flights").filter((el) => (!flightFull(el) && !playerInFlight(el, player)));
};

module.exports = {
    inTeeList: inTeeList,
    flightFull: flightFull,
    availableFlights: availableFlights,
    playerInFlight: playerInFlight,
    findTimes: findTimes
};