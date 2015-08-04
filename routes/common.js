var todayAsDate = function () {
    var today = new Date();
    return new Date((today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear() + " UTC");
};

// format the time part of a date as in "1:05 PM"
var dateToTimeString = function (date) {
    var hour = 0;
    var amPm = "AM";
    var UTCHours = date.getUTCHours();
    switch (UTCHours) {
        case 0:
            hour = 12;
            amPm = "AM";
            break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
            hour = UTCHours;
            amPm = "AM";
            break;
        case 12:
            hour = 12;
            amPm = "PM";
            break;
        default:
            hour = UTCHours - 12;
            amPm = "PM";
    }
    var UTCMinutes = date.getUTCMinutes();
    if (UTCMinutes < 10)
        UTCMinutes = "0" + UTCMinutes;
    return hour + ":" + UTCMinutes + " " + amPm;
};
var convertEventDocumentsToDisplay = function (docs) {
    var events = [];
    docs.forEach(function (event, index) {
        events[index] = {
            name: event.name,
            location: event.location,
            organizations: event.organizations,
            flights: [],
            _id: event._id,
            date: event.dateToDayString()
        };
        event.flights.sort((flight1, flight2) => flight1.time.getTime() - flight2.time.getTime());
        event.flights.forEach(function (flight, jdx) {
            events[index].flights[jdx] = {
                time: dateToTimeString(flight.time),
                maxPlayers: flight.maxPlayers,
                players: flight.players
            };
        });
    });
    return events;
};

var convertEventDocumentsToHTMLValues = function (docs) {
    var events = [];
    docs.forEach(function (event, index) {
        events[index] = {
            name: event.name,
            location: event.location,
            organizations: event.organizations,
            flights: [],
            _id: event._id,
            date: event.dateToHTMLValue()
        };
        event.flights.sort((flight1, flight2) => flight1.time.getTime() - flight2.time.getTime());
        event.flights.forEach(function (flight, jdx) {
            events[index].flights[jdx] = {
                time: event.dateToHTMLTimeValue(flight),
                maxPlayers: flight.maxPlayers,
                players: flight.players
            };
        });
    });
    return events;
};

module.exports = {
    todayAsDate: todayAsDate,
    dateToTimeString: dateToTimeString,
    convertEventDocumentsToDisplay: convertEventDocumentsToDisplay,
    convertEventDocumentsToHTMLValues: convertEventDocumentsToHTMLValues
};


