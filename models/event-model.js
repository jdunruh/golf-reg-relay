var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;

var flightSchema = new mongoose.Schema(
    {time: {type: Date, required: true},
    maxPlayers: {type: Number, required: true},
    players:[ String ]
});


var eventSchema = new mongoose.Schema({
    name: {type: String, required: true},
    date: {type: Date, required: true},
    location: {type: String, required: true, trim: true},
    flights: [flightSchema],
    organizations: [ObjectId]
});

var dateToDayString = function(date) {
    return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
};

var dateToTimeString = function(date) {
    var hour = 0;
    var amPm = "AM";
    var UTCHours = date.getUTCHours;
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
    return hour + ":" + date.getUTCMinutes() + " " + amPm;
};

// remove any flights deleted by the user, and delete the "status" property that should not be saved
eventSchema.methods.filterStatus = function() {
    this.flights.forEach(function(el) {
        if(el.status === "deleted")
            el.remove();
        else
            delete(el.status);
    })
};

// convert strings to dates on save
eventSchema.pre('save', function(next) {
    this.flights.forEach(function(el) {
        el.time = new Date(dayString + " " + timeString + " UTC");
    });
    this.date = new Date(this.date + " UTC");
    next();
});

// sort the flights by time and convert dates to strings on read
eventSchema.pre('init', function(next) {
    this.flights.sort(function(flight1, flight2) {
        return flight1.time.getTime() -  flight2.time.getTime();
    });
    this.flights.forEach(function(el) {
        el.time = dateToTimeString(el.time);
    });
    this.date = dateToDayString(this.date);
    next();
});

var Event = mongoose.model('Event', eventSchema);

module.exports = {
    Event: Event
};
