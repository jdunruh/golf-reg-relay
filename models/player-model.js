const mongoose = require('mongoose'),
      bcrypt = require('bcrypt-nodejs');

var ObjectId = mongoose.Schema.Types.ObjectId;


var fixPassword = function(player, saltFactor, password, next) {
    bcrypt.genSalt(saltFactor, function(err, salt) {
        bcrypt.hash(password, salt, null, function(err, hash) {
            if(err) {
                console.log('error in bcrypt');
                return next(err);
            }
            else {
                player.password = hash;
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
    organizations: [{type: ObjectId, ref: 'Org'}]
});


playersSchema.pre('save', function(next) {
        return fixPassword(this, 10,this.password, next)
});


playersSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, match) {
        if(err)
            return cb(err, null);
        else
            return cb(null, match);
    })
};



module.exports = {
   Player: mongoose.model('Player', playersSchema)
};

