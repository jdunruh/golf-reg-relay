
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var ObjectId = mongoose.Schema.Types.ObjectId;

var playersSchema = new mongoose.Schema({
    name: {type: String, trim: true},
    email: {type: String, lowercase: true, trim: true, required: true, unique: true},
    password: {type: String, required: true},
    registered: Boolean,
    resetToken: String,
    resetExpires: Date,
    organizations: [ObjectId]
});

var fixPassword = function(saltFactor, password, next) {
    bcrypt.genSalt(saltFactor, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            if(err)
                return next(err);
            else {
                player.password = hash;
                console.log("about to call next()");
                next();
            }
        })
    })
};

playersSchema.pre('save', function(next) {
     fixPassword(10,this.password, next)
});

playersSchema.pre('update', function(next) {
    if(!player.isModified('password'))
        fixPassword(10, this.password, next)
});

var Player = mongoose.model('Players', playersSchema);

//index
router.get('/', function(req, res, next) {
    Player.find({}, null, { sort: { _id: 1 } }, function(err, docs) {
        if(err) {
            res.status(404).send();
        } else {
            console.log(docs);
            res.render('players/index.jade', {players: docs});
        }
    })
});

//create
router.post('/', function(req, res, next) {
    var submittedEmail = req.body.email;
    console.log(submittedEmail);
    req.sanitize('name').trim();
    req.sanitize('name').escape();
    req.check('name', "Name cannot be blank").notEmpty();
    req.sanitize('email').normalizeEmail();
    req.check('email', "Not a valid email address").isEmail();
    req.sanitize('password').trim();
    req.sanitize('password-confirm').trim();
    req.check('password', "Invalid Password").notEmpty().isLength(7, 30);
    req.check('password', "Password and password confirmation don't match").passwordMatch(req.body['password-confirm']);
    var mappedErrors = req.validationErrors(true);
    req.body.registered = req.body.registered === 'on'; // make it a boolean with a value if it isn't there
    if(mappedErrors)
        res.render('players/new.jade', {player: {email: submittedEmail,
            name: req.body.name,
            registered: req.body.registered
        },
            errors: req.validationErrors(true)});
    else {
        player = new Player({
            email: submittedEmail,
            password: req.body.password,
            name: req.body.name,
            registered: req.body.registered
        });
        player.save()
            .then(res.redirect(302, '/players'))
            .error(res.render('players/new.jade', {
                player: {
                    email: submittedEmail,
                    name: req.body.name,
                    registered: req.body.registered
                },
                errors: {email: "Unable to save information, try again later"}
            }));
    }
});



//new
router.get('/new', function(req, res, next) {
    res.render('players/new.jade', {player: {email: "",
        name: "",
        registered: false,
        password: ""},
    errors: {}});
});

//show
router.get('/:id', function(req, res, next) {
    Player.find({"_id:": req.params.id}, function(err, docs) {
        if(err) {
            res.status(404).send();
        } else {
            res.render('players/edit.jade', docs);
        }
    })
});

//update
router.post('/:id', function(req, res, next) {
    Player.update({"_id": req.params.id}, {$set: body.params}, function(err, docs) {
        if(err) {
            res.status(404).send();
        } else {
            res.redirect(302, '/' + req.params.id);
        }
    })
});


//edit
router.get('/:id/edit', function(req, res, next) {
    Players.find({"_id:": req.params.id}, function(err, docs) {
        if(err) {
            res.status(404).send();
        } else {
            res.render('players/show.jade', docs);
        }
    })
});



//delete
router.post('/:id/delete', function(req, res, next) {
    Players.remove({_id: req.params.id}, function(err, docs) {
        if(err) {
            res.status(404).send();
        } else {
            res.redirect(302, '/players');
        }
    })
});

module.exports = router;


