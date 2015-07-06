
var express = require('express');
var router = express.Router();

const loginForm = function(req, res, next) {
     res.render('login.jade');
    },
    loginSubmission = function(req, res, next) {

    },
    resetForm = function(req, res, next) {
        res.render('reset.jade');
    },
    resetSubmission = function(req, res, next) {

    };

// login screen - index
router.get('/', loginForm);

// login
router.post('/', loginSubmission);

// password reset form
router.get('/reset/:token', resetForm);

router.post('/reset/:token', resetSubmission);

module.exports = router;