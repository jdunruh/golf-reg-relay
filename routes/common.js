require('babel/polyfill');

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

// param - an array of the parameter path sections where the error occurred
// el - the element to add to the error message object
// obj - the error message object
// mutates obj, and returns the mutated object
var addErrorMessage = function (param, el, obj) {
    var key = param.shift();
    if (param.length === 0) {
        if (obj.hasOwnProperty(key))
            obj[key].push(el);
        else
            obj[key] = [el];
    } else {
        if (!obj.hasOwnProperty(key))
            obj[key] = {};
        this.addErrorMessage(param, el, obj[key])
    }
    return obj;
};

// see if arr1 and arr2 have an element in common
var objectIdArrayMatch = function(arr1, arr2) {
    var combined = arr1.concat(arr2);
    combined.sort(); // sorts array in place
    var previousElement = combined[0];
    for(var i = 1; i < combined.length; i++) {
        if(previousElement.equals(combined[i]))
            return true;
        previousElement = combined[i];
    }
    return false;
};

userOrganizesEvent = function(user, event, organization) {
    return event.organizers.find(el => el === user._id) ||
        organization.organizers.find(el => el === user._id);
};

eventBelongsToOrganization = function(event, organization) {
    return objectIdArrayMatch(event.organizations.find(el => el === organization._id))
};

userCanCreateEvent = function(user, organization) {
    return organization.organizers.find(el => user._id);
};


module.exports = {
    todayAsDate: todayAsDate,
    dateToTimeString: dateToTimeString,
    convertEventDocumentsToDisplay: convertEventDocumentsToDisplay,
    convertEventDocumentsToHTMLValues: convertEventDocumentsToHTMLValues,
    addErrorMessage: addErrorMessage,
    objectIdArrayMatch: objectIdArrayMatch,
    userOrganizesEvent: userOrganizesEvent,
    eventBelongsToOrganization: eventBelongsToOrganization,
    userCanCreateEvent: userCanCreateEvent
};


