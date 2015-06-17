// apply or across an array of boolean values. Good for summarizinng map()s generating boolean results
var orFn = array => array.reduce((el, acc) => el || acc);

var inTeeList = (event, player) =>
    orFn(event.get("flights").map(x => x.get("players").includes(player)));

var getCurrentPlayerName = function() { return "Harry" };

var flightFull = flight => flight.get("players").size >= flight.get("maxPlayers");

var availableFlights = event => event.filter(f => !flightFull(f));

module.exports = {
    inTeeList: inTeeList,
    getCurrentPlayerName: getCurrentPlayerName,
    flightFull: flightFull,
    availableFlights: availableFlights
};