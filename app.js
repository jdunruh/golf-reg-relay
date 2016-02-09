require('dotenv').load();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var schema = mongoose.schema;
var flash = require('express-flash');
var nodemailer = require('nodemailer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var appAPI = require('./routes/user-api.js');
var playersRoute = require('./routes/players.js');
var players = require('./models/player-model');
var login = require('./routes/login');
var events = require('./routes/events');
var organizationsRoute = require('./routes/organizations');
var expressValidator = require('express-validator');
var session = require('express-session');
var users = require('./routes/users');
var eventAPI = require('./routes/event-api');
var orgAPI = require('./routes/organizations-api');

var mongoURI = process.env.MONGOLAB_URI || 'localhost';
var port = process.env.PORT || 3000;

var app = express();

app.set('trust proxy', 1); // trust first proxy


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: '123456',
    resave: false,
    saveUninitialized: false,
    path:"/*" //NEEDED

}));
app.use(passport.initialize());
app.use(passport.session());


app.use(expressValidator({
        customValidators: {
            passwordMatch: (password, confirm) => password === confirm,
            isTime: function (timeString) {
                var match = timeString .match(/^(\d\d):(\d\d)$|^(\d):(\d\d)$/);
                if (match == null)
                    return false;
                var hours = parseInt(match[1], 10);
                var mins = parseInt(match[2], 10);
                return (hours >= 0 && hours <= 23 && mins >= 0 && mins <= 59);
            },
            isFutureDate: function(dateString) {
                var date = new Date(dateString);
                if(isNaN(date))
                    return false;
                return date.getTime() < Date.now() ? false : true;
            }
        }
    }
));


app.use(flash());

passport.serializeUser(function(player, done) {
    done(null, player._id);
});

passport.deserializeUser(function(id, done) {
    players.Player.findById(id, function(err, player) {
        done(err, player);
    });
});


app.use('/', login);
app.use('/api', appAPI);
app.use('/event-api', eventAPI);
app.use('/users', users);
app.use('/players', playersRoute);
app.use('/events', events);
app.use('/organizations', organizationsRoute);
app.use('/organization-api', orgAPI);
app.get('/organizers/*', function(req, res) {
    res.sendFile(path.resolve(__dirname, 'public', 'organizers.html'))
});
app.get('*', function(request, response){
    response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
});



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
        console.log(error);
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

app.listen(port);

//console.log("connecting to " + mongoURI + "/golf-reg");
//console.log(mongooseUri);



module.exports = app;
