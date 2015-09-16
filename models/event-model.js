var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;

var golferSchema = new mongoose.Schema({
    name: {type: String, required: true},
    id: {type: ObjectId, required: true},
    addedBy: {type: ObjectId, required: true}
});

var flightSchema = new mongoose.Schema({
    time: {type: Date, required: true},
    maxPlayers: {type: Number, required: true},
    players:[ golferSchema ]
});


var eventSchema = new mongoose.Schema({
    name: {type: String, required: true},
    date: {type: Date, required: true},
    location: {type: String, required: true, trim: true},
    flights: [flightSchema],
    organizations: [ObjectId],
    organizers: [ObjectId]
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
    var UTCHours = flight.time.getUTCHours();
    if(UTCMinutes < 10)
        UTCMinutes = "0" + UTCMinutes;
    if(UTCHours < 10)
        UTCHours = "0" + UTCHours;
    return UTCHours + ":" + UTCMinutes;
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

eventSchema.pre('save', function(next) {
    if(this.flights.map(el => el.players.length > el.maxPlayers).reduce((acc, el) => acc || el, false))
        next(new Error('Flight overfilled'));
    else
        next();
});


var Event = mongoose.model('Event', eventSchema);

module.exports = {
    Event: Event
};

// update the object according to keys in arr (creating keys if needed) with the val
var update = function(obj, keyArr,  val) {
    if(keyArr.length === 1) {
        obj[keyArr[0]] = val;
    } else {
        if(!obj[keyArr[0]])
            obj[keyArr[0]]= {};
        update(obj[keyArr[0]], keyArr.slice(1), val);
   }
};
