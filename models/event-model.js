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

eventSchema.methods.dateToDayString = function() {
    return (this.date.getUTCMonth() + 1) + "/" + this.date.getUTCDate() + "/" + this.date.getUTCFullYear();
};

eventSchema.methods.dateToHTMLValue = function() {
    var UTCMonth = this.date.getUTCMonth() + 1;
    var UTCDate = this.date.getUTCDate();
    if(UTCMonth < 10)
        UTCMonth = "0" + UTCMonth;
    if(UTCDate < 10)
        UTCDate = "0" + UTCDate;
    return this.date.getUTCFullYear() +  "-" + UTCMonth + "-" + UTCDate;
};

eventSchema.methods.dateToHTMLTimeValue = function(flight) {
    var UTCMinutes = flight.time.getUTCMinutes();
    if(UTCMinutes < 10)
        UTCMinutes = "0" + UTCMinutes;
    return flight.time.getUTCHours() + ":" + UTCMinutes;
};

flightSchema.methods.dateToTimeString = function() {
    var hour = 0;
    var amPm = "AM";
    var UTCHours = this.time.getUTCHours();
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
    var UTCMinutes = this.time.getUTCMinutes();
    if(UTCMinutes < 10)
        UTCMinutes = "0" + UTCMinutes;
    return hour + ":" + UTCMinutes + " " + amPm;
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



var Event = mongoose.model('Event', eventSchema);

module.exports = {
    Event: Event
};
