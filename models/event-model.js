var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;


var eventSchema = new mongoose.Schema({
    name: {type: String, required: true},
    date: {type: Date, required: true},
    location: {type: String, required: true, trim: true},
    flights: [{time: {type: Date, required: true},
        maxPlayers: {type: Number, required: true},
        players:[ String ]
    }],
    organizations: [ObjectId]
});

var Event = mongoose.model('Event', eventSchema);

module.exports = {
    Event: Event
};
