
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

playersSchema.pre('save', function(next) {
    if(!this.isModified('password'))
        return fixPassword(this, 10,this.password, next)
});

playersSchema.pre('update', function(next) {
    if(!this.isModified('password'))
        return fixPassword(this, 10, this.password, next)
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

var validateForm = function(req) {
    req.sanitize('name').trim();
    req.sanitize('name').escape();
    req.check('name', "Name cannot be blank").notEmpty();
    req.check('email', "Not a valid email address").isEmail();
    req.sanitize('password').trim();
    req.sanitize('password-confirm').trim();
    if (req.body.password.length > 0) {
        req.check('password', "Invalid Password").notEmpty().isLength(7, 30);
        req.check('password', "Password and password confirmation don't match").passwordMatch(req.body['password-confirm']);
    }
    req.body.registered = req.body.registered === 'on'; // make it a boolean with a value if it isn't there
    return req.validationErrors(true);
    };

//create
router.post('/', function(req, res, next) {
    req.sanitize('email').normalizeEmail();
    var submittedEmail = req.body.email;
    var mappedErrors = validateForm(req);
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
            .end(res.render('players/new.jade', {
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
    Player.findById(req.params.id, function(err, docs) {
        if(err) {
            res.status(404).send();
        } else {
            res.render('players/show.jade', {player: docs, errors:{}});
        }
    })
});

//update
router.post('/:id', function (req, res, next) {
    req.sanitize('email').normalizeEmail();
    var submittedEmail = req.body.email; // save because validator wipes this out
    var mappedErrors = validateForm(req);
    if (mappedErrors)
        res.render('players/edit.jade', {
            player: {
                email: submittedEmail,
                name: req.body.name,
                registered: req.body.registered
            },
            errors: mappedErrors
        });
    else {
        Player.findById(req.params.id, function (err, player) {
            if (err)
                res.redirect(302, '/players');
            else {
                console.log("first player");
                console.log(player);
                player.email = submittedEmail;
                player.name = req.body.name;
                player.registered = req.body.registered;
                if (req.body.password.length > 0)
                    player.password = req.body.password;
                console.log("second player");
                console.log(player);
                player.save(function (err, player) {
                    if (err)
                        res.redirect(302, '/players');
                    else
                        res.redirect(302, '/players/' + req.params.id)
                });
            }
        })
    }
});


//edit
router.get('/:id/edit', function(req, res, next) {
    console.log(req.params.id);
    Player.findById(req.params.id, function(err, docs) {
        if(err) {
            res.redirect(302, '/players');
        } else {
            res.render('players/edit.jade', {player: docs, id: req.params.id, errors: {}});
        }
    });
});



//delete
router.post('/:id/delete', function(req, res, next) {
    Player.findByIdAndRemove(req.params.id, function(err, docs) {
        if(err) {
            res.status(404).send();
        } else {
            res.redirect(302, '/players');
        }
    })
});

module.exports = router;


