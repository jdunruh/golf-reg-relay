
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var players = require('../models/player-model');
var organizations = require('../models/organization-model');

var ObjectId = mongoose.Schema.Types.ObjectId;



//index
router.get('/', function(req, res, next) {
    players.Player.find({}, null, { sort: { _id: 1 } }, function(err, docs) {
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
router.post('/', function (req, res, next) {
    req.sanitize('email').normalizeEmail();
    var submittedEmail = req.body.email;
    var mappedErrors = validateForm(req);
    if (mappedErrors) {
        res.render('players/new.jade', {
            player: {
                email: submittedEmail,
                name: req.body.name,
                registered: req.body.registered
            },
            errors: req.validationErrors(true)
        });
    }
    else {
        player = new players.Player({
            email: submittedEmail,
            password: req.body.password,
            name: req.body.name,
            registered: req.body.registered
        });
        organizations.Org.find({name: 'Up the Creek Ski and Recreation Club'})
            .then(function (docs) {
                player.organizations = [docs[0]._id];
                return player.save()
            })
            .then(function () {
                res.redirect(302, '/players')
            }
            , function (err) {
                res.render('players/new.jade', {
                    player: {
                        email: submittedEmail,
                        name: req.body.name,
                        registered: req.body.registered
                    },
                    errors: {email: {msg: "email address already in system"}}
                })
            });
    }
});



//new
router.get('/new', function(req, res, next) {
    res.render('players/new.jade', {player: {email: "",
        name: "",
        registered: false,
        password: ""},
    errors: {},
    referrer: req.get('Referrer')});
});

//show
router.get('/:id', function(req, res, next) {
    players.Player.findById(req.params.id, function(err, docs) {
        console.log(docs);
        if(err) {
            res.status(404).send();
        } else {
            res.render('players/show.jade', {player: docs, errors:{}, referrer: req.get('Referrer')});
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
        players.Player.findById(req.params.id, function (err, player) {
            if (err)
                res.redirect(302, '/players');
            else {
                player.email = submittedEmail;
                player.name = req.body.name;
                player.registered = req.body.registered;
                if (req.body.password.length > 0)
                    player.password = req.body.password;
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
    players.Player.findById(req.params.id, function(err, docs) {
        if(err) {
            res.redirect(302, '/players');
        } else {
            res.render('players/edit.jade', {player: docs, id: req.params.id, errors: {}, referrer: req.get('Referrer')});
        }
    });
});



//delete
router.post('/:id/delete', function(req, res, next) {
    players.Player.findByIdAndRemove(req.params.id, function(err, docs) {
        if(err) {
            res.status(404).send();
        } else {
            res.redirect(302, '/players');
        }
    })
});

module.exports = router;


