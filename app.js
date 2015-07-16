require('dotenv').load();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var schema = mongoose.schema;
var cookieSession = require('cookie-session');
var flash = require('express-flash');
var nodemailer = require('nodemailer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var appAPI = require('./routes/user-api.js');
var users = require('./routes/users');
var players = require('./routes/players');
var login = require('./routes/login');
var events = require('./routes/events');
var expressValidator = require('express-validator');

var mongoURI = process.env.MONGOLAB_URI || 'localhost';

var app = express();

app.set('trust proxy', 1); // trust first proxy


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(express.static('.'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(expressValidator({customValidators: {
    passwordMatch: (password, confirm) => password === confirm,
    isFuture: (date) => date > Date.now()
}}));


app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_KEY_1, process.env.SESSION_KEY_2, process.env.SESSION_KEY_3, process.env.SESSION_KEY_4],
    signed: true,
    secureProxy: true
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', appAPI);
app.use('/users', users);
app.use('/players', players);
app.use('/events', events);
app.use('/', login);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

mongoose.connect(mongoURI + '/golf-reg');

app.listen(3000);

//console.log("connecting to " + mongoURI + "/golf-reg");
//console.log(mongooseUri);



module.exports = app;
