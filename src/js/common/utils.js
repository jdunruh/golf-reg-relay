var im = require('immutable');

// apply or across an array of boolean values. Good for summarizinng map()s generating boolean results
var orFn = array => array.reduce((el, acc) => el || acc);

var inTeeList = (event, player) =>
    orFn(event.get("flights").map(x => x.get("players").includes(player)));

var getCurrentPlayerName = function() { return "Harry" };

var flightFull = flight => flight.get("players").size >= flight.get("maxPlayers");

var availableFlights = event => event.filter(f => !flightFull(f));

var playerInFlight = (flight, player) => flight.get("players").includes(player);


var findTimes = function(event, player) {
    return event.get("flights").reduce(function (acc, el, index) {
        if (!flightFull(el) && !playerInFlight(el, player))
            return acc.push(im.Map({index: index, time: el.get("time")}));
        else
            return acc;
    }, im.List.of());
};





module.exports = {
    inTeeList: inTeeList,
    getCurrentPlayerName: getCurrentPlayerName,
    flightFull: flightFull,
    availableFlights: availableFlights,
    playerInFlight: playerInFlight,
    findTimes: findTimes
};