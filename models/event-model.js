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
