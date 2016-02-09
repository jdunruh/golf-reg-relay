
var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();
var persist = require('../persist');
var mailer = require('../mailer');
var csp = require('js-csp');
var players = require('../models/player-model');


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

var validateForm = function(req) {
    console.log(req.body);
    req.check('email', "Not a valid email address").isEmail();
    req.sanitize('password').trim();
    req.sanitize('password-confirm').trim();
    if (req.body.password.length > 0) {
        req.check('password', "Invalid Password").notEmpty().isLength(7, 30);
        req.check('password', "Password and password confirmation don't match").passwordMatch(req.body['password-confirm']);
    }
    return req.validationErrors(true);
};


const loginForm = function(req, res, next) {
     res.render('login.jade');
    },
    resetForm = function(req, res, next) {
        res.render('reset-request.jade');
    },
    resetSubmission = function(req, res, next) {
        csp.go(function* () {
            var ret = yield csp.take(persist.getPlayerByEmail(players.Player, req.body.username));
            if ((ret instanceof Error) || (ret.length === 0)) // could not find email
                res.redirect('/reset');
            var player = ret[0];
            var resetToken = yield csp.take(mailer.generateToken());
            var result = yield csp.take(persist.updateModel(players.Player, {_id: player._id, resetToken: resetToken,
                                                                                resetExpires: (Date.now() + 87000000)})); // 24 hr expiration
            var host = req.protocol + "://" + req.headers.host;
            console.log(host);
            if (result instanceof Error)
                next(result);   // internal server error saving token and date
            if(yield csp.take(mailer.passwordResetEmail({from: 'noreply@golfsignup.com',
                                                         to: player.email,
                                                         subject: "Password Change for golf signup"},
                    resetToken, host)) instanceof Error)
                console.log("unable to send reset email to " + player.name);
            res.redirect('/resetready');
        })
    },
    doReset = function(req, res, next) {
        csp.go(function* () {
            var result = yield csp.take(persist.getPlayerByToken(players.Player, req.params.token));
            console.log(result);
            console.log('result has length ' + result.length);
            if ((result instanceof Error) || (result.length === 0)) { // could not find email
                console.log("can't find email, redirectinng");
                res.redirect('/reset');
                return undefined
            }
            player=result[0];
            if (player.resetExpires < Date.now()) {
                console.log("reset expired - time was " + player.resetExpires);
                res.redirect('/reset');
                return undefined;
            }
            req.sanitize('email').normalizeEmail();
            var holdEmail = req.body.email;
            var errors = validateForm(req);
            if (errors) {
                res.render('reset-form.jade', {email: holdEmail, errors: errors, token: req.params.token});
                return undefined;
            }
            if (holdEmail != player.email) {
                res.render('reset-form.jade', {email: holdEmail, errors: {email: "Wrong email address"},
                                                token: req.params.token});
                return undefined;
            }
            console.log("finished validations");
            player.password = req.body.password;
            player.resetToken = "";
            player.resetExpires = undefined;
            console.log('about to save player');
            var result = yield csp.take(persist.saveModel(player));
            if (result instanceof Error) { // could not save email
                console.log(result);
                next(result);
            }
            console.log('about to log user in');
            req.logIn(player, function(err) {
                res.redirect('/');
            });
        })
    };


// home page is login
router.get('/', loginForm);

// login screen - index
router.get('/login', loginForm);

// login
router.post('/login', passport.authenticate('local', {successRedirect: '/signup',
    failureRedirect: '/login'}));

// logout
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

// password reset form
router.get('/reset', resetForm);

router.get('/resetready', function(req, res) {
    res.render('reset-ready.jade');
});

router.post('/reset', resetSubmission);

router.get('/doreset/:token', function(req, res) {
    res.render('reset-form.jade', {token: req.params.token, errors: {}});
});

router.post('/doreset/:token', function(req, res) {
    doReset(req, res);
});

module.exports = router;