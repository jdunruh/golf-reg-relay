const mongoose = require('mongoose'),
      bcrypt = require('bcrypt-nodejs');

var ObjectId = mongoose.Schema.Types.ObjectId;


var fixPassword = function(player, saltFactor, password, next) {
    console.log('in password encryption');
    bcrypt.genSalt(saltFactor, function(err, salt) {
        console.log('salted');
        bcrypt.hash(password, salt, null, function(err, hash) {
            if(err) {
                console.log('error in bcrypt');
                return next(err);
            }
            else {
                player.password = hash;
                console.log('hashed password, about to call next() hash = ' + hash);
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
    console.log('about to hash password');
        return fixPassword(this, 10,this.password, next)
});

playersSchema.pre('update', function(next) {
    if(!this.isModified('password'))
        return fixPassword(this, 10, this.password, next)
});

playersSchema.methods.comparePassword = function(candidatePassword, cb) {
    console.log('in comparePassord this.password = ' + this.password + 'candidatePassword = ' + candidatePassword);
    bcrypt.compare(candidatePassword, this.password, function(err, match) {
        if(err)
            return cb(err, null);
        else
            return cb(null, match);
    })
};



module.exports = {
   Player: mongoose.model('Players', playersSchema)
};

