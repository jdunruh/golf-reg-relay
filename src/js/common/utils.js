// apply or across an array of boolean values. Good for summarizinng map()s generating boolean results
var orFn = array => array.reduce((el, acc) => el || acc);

var inTeeList = (teeList, player) =>
    orFn(teeList.flights.map(x => x.players.indexOf(player) != -1));

var getCurrentPlayerName = function() { return "Harry" };

var flightFull = flight => flight.players.length >= flight.maxPlayers;

var availableFlights = event => event.filter(f => !flightFull(f));

module.exports = {
    inTeeList: inTeeList,
    getCurrentPlayerName: getCurrentPlayerName,
    flightFull: flightFull,
    availableFlights: availableFlights
};