var nodemailer = require('nodemailer');
var sendGridTransport = require('nodemailer-sendgrid-transport');
var crypto = require('crypto');

var csp = require('js-csp');

// stub out transport for unit tests
var stubTransport = require('nodemailer-stub-transport');


var SendGridOptions = {
    auth: {
        api_user: process.env.SENDGRID_USERNAME,
        api_key: process.env.SENDGRID_PASSWORD
    }
};

var mailer = nodemailer.createTransport(sendGridTransport(SendGridOptions));


module.exports = {
    passwordResetEmail: function (mailParams, token, host) {
        console.log('preparing to send email');
        var ch = csp.chan();
        mailParams.text = "Go to this link to reset your golf signup password: "+ host + "/doreset/" + token;
        mailer.sendMail(mailParams, function (err, result) {
            if (err)
                csp.putAsync(ch, err);
            else {
                console.log(result);
                csp.putAsync(ch, result);
            }
        });
        return ch;
    },
    generateToken: function() {
        console.log('generateToken');
        var ch = csp.chan();
        crypto.randomBytes(20, function(err, buf) {
            console.log('ranbomBytes returned');
            csp.putAsync(ch,  buf.toString('hex'));
            console.log('token written to channel')
        });
        return ch;
    },
    setStubTransport: function () {
        console.log('using stub transport');
        mailer = nodemailer.createTransport(stubTransport());
    },
    setFailingTransport: function () {
        console.log('using failing transport');
        mailer = nodemailer.createTransport(stubTransport({
            error: new Error('Invalid recipient')
        }))
    }
};








