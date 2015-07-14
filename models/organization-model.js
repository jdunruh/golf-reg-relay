var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;


var organizationSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    organizers: [ObjectId]
});



module.exports = {
    Org = new mongoose.model('Org', organizationSchema)
};
