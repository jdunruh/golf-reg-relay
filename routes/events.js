
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var events = require('../models/event-model');
var persist = require('../persist');
var csp = require('js-csp');

var ObjectId = mongoose.Schema.Types.ObjectId;

var validateEvent = function(req) {
    console.log(req.body);
    req.sanitize('name').trim();
    req.sanitize('location').trim();
    req.check('name', 'A name between 5 and 100 characters must be supplied').notEmpty().isLength(5, 100);
    req.check('location', 'A location between 5 and 100 characters must be supplied').notEmpty().isLength(5,100);
    req.body.flights.forEach(function(el, index) {
        req.check(['flights', index, 'maxPlayers'], "Incorrect value for Maximum Players").notEmpty().isNumeric();
        req.check(['flights', index, 'time'], "Must supply a valid time").notEmpty().isTime();
    });
    req.check('date', "A date later than today must be supplied").notEmpty().isFutureDate();
    return req.validationErrors(true);
};


var convertEventDatesAndTimes = function(event) {
    event.flights.forEach(function(el) {
        el.time = new Date(event.date + " " + el.time + " UTC");
    });
    event.date = new Date(event.date + " UTC");
};

var todayAsDate = function() {
    var today = new Date();
    return new  Date((today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear() + " UTC");
};



var indexAction = function(req, res, next) {
    csp.go(function* () {
        var allEvents = yield csp.take(persist.getAll(events.Event));
        if(allEvents instanceof Error)
            next(allEvents);
        else
            res.render('events/index.jade', {events: allEvents, errors: {}});
    })
};

var newAction = function(req, res) {
    var myEvent = new events.Event({name: '',
        location: '',
        date: todayAsDate(),
        flights: [
            {time: '',
                maxPlayers: ''}
        ]});

    res.render('events/new.jade',
                            {event: myEvent,
                                    errors: {},
                                    referrer: req.get('Referrer')})
};

var createAction = function(req, res, next) {
    var mappedErrors = validateEvent(req);
    if(mappedErrors) {
        console.log(mappedErrors);
        res.render('events/new.jade', {event: req.body, errors: mappedErrors});
    } else {
        convertEventDatesAndTimes(req.body);
        var event = new events.Event(req.body);
        event.filterStatus();
        console.log(event);
        console.log("persisting");
        csp.go(function*() {
            var result = yield csp.take(persist.saveModel(event));
            if (result instanceof Error)
                next(500, result);
            else
                res.redirect('/events');
        })
    }
};

var showAction = function(req, res, next) {
    csp.go(function*() {
        var myEvent = yield csp.take(persist.getModelById(events.Event, req.params.id));
        if(myEvent instanceof Error)
            next(404, myEvent);
        else
            res.render('events/show.jade', {event: myEvent, errors: {}});
    })
};

var editAction = function(req, res, next) {
    csp.go(function*() {
        var myEvent = yield csp.take(persist.getModelById(events.Event, req.params.id));
        if(myEvent instanceof Error)
            next(404, myEvent);
        else
            res.render('events/edit.jade', {event: myEvent, errors: {}})
    })
};

var updateAction = function(req, res, next) {
    var mappedErrors = validateEvent(req);
    if(mappedErrors) {
        res.render('events/new.jade', {event: req.body, errors: mappedErrors});
    } else {
        convertEventDatesAndTimes(req.body);
        var event = new events.Event(req.body);
        event.filterStatus();
        csp.go(function*() {
            var result = yield csp.take(persist.saveModel(event));
            if (result instanceof Error)
                next(500, result);
            else
                res.redirect('/events');
        })
    }
};

var deleteAction = function(req, res, next) {
    csp.go(function*() {
        var result = yield csp.take(persist.removeModel(events.Event, req.params.id));
        if(result instanceof Error)
            next(500, result);
        else
            res.redirect('/events');
    })
};

// index
router.get('/', indexAction);
// create
router.post('/', createAction);
// new
router.get('/new', newAction);
// show
router.get('/:id', showAction);
// edit
router.get('/:id/edit', editAction);
// update
router.post('/:id', updateAction);
// delete
router.post('/:id/delete', deleteAction);

module.exports = router;


