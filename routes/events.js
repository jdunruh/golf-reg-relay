
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var events = require('../models/event-model');
var persist = require('../persist');
var csp = require('js-csp');
var common = require('./common.js');
var organizations = require('../models/organization-model');
var players = require('../models/player-model');

var ObjectId = mongoose.Schema.Types.ObjectId;

var validateEvent = function(req) {
    req.sanitize('name').trim();
    req.sanitize('location').trim();
    req.check('name', 'A name between 5 and 100 characters must be supplied').notEmpty().isLength(5, 100);
    req.check('location', 'A location between 5 and 100 characters must be supplied').notEmpty().isLength(5,100);
    req.body.flights.forEach(function(el, index) {
        req.check(['flights', index, 'maxPlayers'], "Maximum Players must be a number").notEmpty().isNumeric();
        req.check(['flights', index, 'time'], "Must supply a valid time").notEmpty().isTime();
    });
    req.check('date', "A date later than today must be supplied").notEmpty().isFutureDate();
    var errors = null;
    if(req.validationErrors()) {
        errors = {};
        req.validationErrors().forEach(function (err) {
            common.addErrorMessage(Array.isArray(err.param) ? err.param : [err.param], err, errors)
        });
    }
     return errors;
};


var convertEventDatesAndTimes = function(event) {
    event.flights.forEach(function(el) {
        el.time = new Date(event.date + " " + el.time + " UTC");
    });
    event.date = new Date(event.date + " UTC");
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

/* logged in user allowed to see event if the user is an organizer for the event
or if the user is an organizer for an organization sponsoring the event
 */
var filterEvents = function(event, organization, user) {

};

var addScope = function(andOr, scope, query) {
    if(andOr === "and") {
        var updatedQuery = query;
        for(key in scope) {
            updatedQuery[key] = scope[key];
        }
        return updatedQuery;
    } else {
        return {$or: [query, scope]};
    }
};

var getAllowedEvents= function(user, event_id) {
    csp.go(function*() {
        var eventQuery;
        var orgs = yield csp.take(persist.findModelByQuery(organizations.Org, {organizers: {$in: [user._id]}}));
        if(orgs instanceof Error) {
            return orgs;
        }
        var orgIds = orgs.map(org => org._id); // project _id
        if(event_id) // optional and argument to match on an event_id
            eventQuery = {event: event_id};
        else
            eventQuery = {};
        eventQuery['$or:'] = [{organizers: {$in: [user._id]}},
            {organizations: {$in: orgIds}}];
        var events = yield csp.take(persist.findModelByQuery(events.Event, eventQuery));
        return events;
    })
};

var newAction = function(req, res) {
    var myEvent = new events.Event({name: '',
        location: '',
        date: common.todayAsDate(),
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
        res.render('events/new.jade', {event: req.body, errors: mappedErrors});
    } else {
        convertEventDatesAndTimes(req.body);
        var event = new events.Event(req.body);
        event.filterStatus();
        csp.go(function*() {
            var organization = yield csp.take(persist.findModelByQuery(organizations.Org, {name: "Up the Creek Ski and Recreation Club"}));
            if (organization instanceof Error)
                next(500, "Data is Inconsistent");
            else {
                event.organizations = [organization[0]._id];
                organization[0].organizers.forEach(function(el) {
                    event.organizers.push(el);
                });
                var result = yield csp.take(persist.saveModel(event));
                if (result instanceof Error)
                    next(500, result);
                else
                    res.redirect('/events');
            }
        });
    }
};

var showAction = function(req, res, next) {
    csp.go(function*() {
        var myEvent = yield csp.take(persist.getModelById(events.Event, req.params.id));
        if(myEvent instanceof Error)
            next(404, myEvent);
        else
            res.render('events/show.jade', {event: myEvent, errors: {}, common: common});
    })
};

var editAction = function(req, res, next) {
    csp.go(function*() {
        var myEvent = yield csp.take(persist.getModelById(events.Event, req.params.id));
        if(myEvent instanceof Error)
            next(404, myEvent);
        else {
            console.log(common.convertEventDocumentsToHTMLValues([myEvent])[0]);
            res.render('events/edit.jade', {event: common.convertEventDocumentsToHTMLValues([myEvent])[0], errors: {}});
        }
    })
};

var updateAction = function(req, res, next) {
    var mappedErrors = validateEvent(req);
    if(mappedErrors) {
        res.render('events/edit.jade', {event: req.body, errors: mappedErrors});
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

// middleware to find events not restricted for this user
router.use(function(req, res, next) {
    var allowedEvents = getAllowedEvents(req.user, req.params.id); // note req.params.id will be null if the request didn't have an :id segment
    if(allowedEvents instanceof Error) {
        next(403, allowedEvents);
    } else {
        req.allowedEvents = allowedEvents;
        next();
    }
});
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


