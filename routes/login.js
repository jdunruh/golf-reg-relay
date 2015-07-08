
var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();
var persist = require('../persist');
var csp = require('js-csp');
var players = require('../models/player-model');

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
    players.Player.findOne({ email: username }, function(err, player) {
        if (err) return done(err);
        if (!player) return done(null, false, { message: 'Incorrect email/password combination.' });
        player.comparePassword(password, function(err, isMatch) {
            if (isMatch) {
                return done(null, player);
            } else {
                return done(null, false, { message: 'Incorrect email//password.' });
            }
        });
    });
}));



const loginForm = function(req, res, next) {
     res.render('login.jade');
    },
    resetForm = function(req, res, next) {
        res.render('reset.jade');
    },
    resetSubmission = function(req, res, next) {

    };

// login screen - index
router.get('/login', loginForm);

// login
router.post('/login', passport.authenticate('local', {successRedirect: '/',
    failureRedirect: '/login'}));

// logout
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

// password reset form
router.get('/reset/:token', resetForm);

router.post('/reset/:token', resetSubmission);

module.exports = router;