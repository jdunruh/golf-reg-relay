var validator = require('node-validator');
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

var validateEvent = function(event) {
    event.name = validate.trim(event.name);
    event.location = validate.trim(event.location);
    return validate.notEmpty(event.name) &&
    validate.isLength(event.name, 5, 100) &&
    validate.notEmpty(event.location) &&
    validate.isLength(event.location, 5,100) &&
    event.flights.reduce(function(el) {
        return validate.isNumeric(el.maxPlayers) &&
        validate.isTime(el.time);
    }, true) &&
    validate.isFutureDate(event.date);
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
        for(var key in scope) {
            updatedQuery[key] = scope[key];
        }
        return updatedQuery;
    } else {
        return {$or: [query, scope]};
    }
};

var getAllowedEvents = function(user, complete) {
    csp.go(function*() {
        var eventQuery;
        var orgs = yield csp.take(persist.findModelByQuery(organizations.Org, {organizers: {$in: [user._id]}}));
        if(orgs instanceof Error) {
            complete(404, orgs);
            return;
        }
        var orgIds = orgs.map(org => org._id); // project _id
        if(event_id) // optional and argument to match on an event_id
            eventQuery = {event: event_id};
        else
            eventQuery = {};
        eventQuery['$or:'] = [{organizers: {$in: [user._id]}},
            {organizations: {$in: orgIds}}];
        var events = yield csp.take(persist.findModelByQuery(events.Event, eventQuery));
        return complete(200, events);
    })
};

var createEvent = function(user, event, complete) {
    if(!validateEvent(event))
        complete(403, {errors: "invalid event"});
    else {
        convertEventDatesAndTimes(event);
        var myEvent = new events.Event(event);
        csp.go(function*() {
            var orgs = yield csp.take(persist.findModelByQuery(organizations.Org, {_id: {$in: event.organizations}}));
            if (orgs instanceof Error)
                next(500, "Data is Inconsistent");
            else {
                if(!orgs.reduce(org => acc || common.userCanCreateEvent(user, org), false)) {
                    completion(403, false);
                    return;
                }
                var result = yield csp.take(persist.saveModel(event));
                if (result instanceof Error)
                    complete(500, result);
                else
                    complete(200, '');
            }
        });
    }
};

var getEvent = function(event, user, complete) {
    csp.go(function*() {
        var myEvent = yield csp.take(persist.getModelById(events.Event, event));
        if(myEvent instanceof Error)
            complete(404, myEvent);
        else {
            var orgs = yield csp.take(persist.findModelByQuery(organizations.Org, {_id: {$in: myEvent.organizations}}));
            if(orgs instanceof Error) {
                complete(500, orgs);
                return;
            }
            if(!orgs.reduce(org => acc || common.userOrganizesEvent(user, event, org), false)) {
                completion(403, false);
            } else
                complete(200, MyEvent);
        }
    })
};


var updateEvent = function(event, user, completion) {
    csp.go(function* () {
        var orgs = yield csp.take(persist.findModelByQuery(organizations.Org, {_id: {$in: event.organizations}}));
        if (orgs instanceof Error) {
            completion(500, orgs);
            return;
        }
        if(!orgs.reduce(org => acc || common.userOrganizesEvent(user, event, org), false)) {
            completion(403, false);
            return;
        }
    if(!validateEvent(event)){
        completion(403, false);
    } else {
        convertEventDatesAndTimes(req.body);
        var event = new events.Event(req.body);
        var result = yield csp.take(persist.saveModel(event));
        if (result instanceof Error)
            completion(500, result);
        else
            completion(200, result);
        }
    });
};

var deleteEvent = function(user, event, complete) {
    csp.go(function*() {
        if (orgs instanceof Error) {
            var orgs = yield csp.take(persist.findModelByQuery(organizations.Org, {_id: {$in: event.organizations}}));
                completion(500, orgs);
                return;
            }
            if(!orgs.reduce(org => acc || common.userOrganizesEvent(user, event, org), false)) {
                completion(403, false);
                return;
            }
        var result = yield csp.take(persist.removeModel(events.Event, event));
        if(result instanceof Error)
            complete(500, result);
        else
            complete(200, result);
    })
};


var sendResponse = function(res, status, body) {
    res.status(status).body(body);
};

router.patch('/updateEvent', function(req, res) {
    updateEvent(req.body.event, req.user, sendResponse.bind(null, res));
});
router.get('/getAllEvents', function(req, res) {
    getAllowedEvents(req.user, sendResponse.bind(null, res));
});
// create
router.put('/addEvent', function(req, res) {
    createEvent(req.user, req.body.event, sendResponse.bind(null, res));
});
// show
router.get('/:id', function() {
    getEvent(req.body.event, req.user, sendResponse.bind(null, res));
});
// delete
router.post('/removeEvent', function() {
    deleteEvent(req.user, req.body.event, sendResponse.bind(null, res));
});

module.exports = router;


