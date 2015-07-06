const mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;


var fixPassword = function(player, saltFactor, password, next) {
    bcrypt.genSalt(saltFactor, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            if(err)
                return next(err);
            else {
                player.password = hash;
                console.log("about to call next()");
                return next();
            }
        })
    })
};

playersSchema = new mongoose.Schema({
    name: {type: String, trim: true},
    email: {type: String, lowercase: true, trim: true, required: true, unique: true},
    password: {type: String, required: true},
    registered: Boolean,
    resetToken: String,
    resetExpires: Date,
    organizations: [ObjectId]
});

playersSchema.pre('save', function(next) {
    if(!this.isModified('password'))
        return fixPassword(this, 10,this.password, next)
});

playersSchema.pre('update', function(next) {
    if(!this.isModified('password'))
        return fixPassword(this, 10, this.password, next)
});



module.exports = {
    Player: mongoose.model('Players', playersSchema)
};