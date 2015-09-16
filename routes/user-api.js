

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var common = require('./common');
var persist = require('../persist');
var csp = require('js-csp');
var ObjectId = mongoose.Schema.Types.ObjectId;


var events = require('../models/event-model');
var players = require('../models/player-model');


// event - event object, flight - flight index into event.flights array, player - player being changed
var authorizedEventUpdate = function(user, player) {
    console.log(user);
    console.log(player);
        return player.id === user._id.toHexString() || player.addedBy === user._id.toHexString();
};

// see if arr1 and arr2 have an element in common
var objectIdArrayMatch = function(arr1, arr2) {
    var combined = arr1.concat(arr2);
    combined.sort(); // sorts array in place
    var previousElement = combined[0];
    for(var i = 1; i < combined.length; i++) {
        if(previousElement.equals(combined[i]))
            return true;
        previousElement = combined[i];
    }
    return false;
};


var removePlayerFromFlight = function(flightPlayers, player) {
    return flightPlayers.filter(el => el.name != player.name);
};

var findPlayerInFilght = function(flightPlayers, player) {
    return flightPlayers.find(el => el.name === player.name);
};

var playerInFlight = function(flightPlayers, player) {
    return flightPlayers.some(el => el.name === player.name);
};

var getAllPlayers = function(res) {
    csp.go(function*() {
        var result = yield csp.take(persist.getAll(players.Player));
        if(result instanceof Error)
            res.status(404);
        else {
            console.log(result);
            res.status(200).json(result);
        }
    })
};


router.get('/getAllEVents', function(req, res, next) {
    events.Event.find({}, null, { sort: { _id: 1 } }, function(err, docs) { // get events sorted by date
        if(err) {
            res.status(404).json(err);
        } else { // have good data. Sort events by date then flights by time and then convert date and time values for display
             var events = common.convertEventDocumentsToDisplay(docs);
             res.status(200).json(events);
        }
    })
});

router.delete('/removeModel/', function (req, res, next) {
    csp.go(function* () {
        var event = yield csp.take(persist.getModelById(events.Event, req.body.event));
        if (event instanceof Error) {
            res.status(404).json(event);
            return;
        }
        if (!(authorizedEventUpdate(req.user, req.body.player))) {
            res.status(500).json({error: "You can only cancel your time or the time of someone you added"});
            return;
        }
        if (!event.flights[req.body.flight]) {
            res.status(500).json({error: "no such flight"});
            return;
        }
        event.flights[req.body.flight].players = removePlayerFromFlight(event.flights[req.body.flight].players, req.body.player);
        var result = yield csp.take(persist.saveModel(event));
        if (result instanceof Error) {
            res.status(500).json(result);
        } else {
            res.status(200).json(result);
        }
    })
});


router.put('/addPlayer/', function(req, res, next) {
    csp.go(function* () {
        var event = yield csp.take(persist.getModelById(events.Event, req.body.event));
        if (event instanceof Error)
            res.status(404).json(event);
        else {
            if(playerInFlight(event.flights[req.body.flight].players, req.body.player)) {
                res.status(200).json({status: "already in flight"});
                return;
            }
            if (objectIdArrayMatch(event.organizations, req.user.organizations)) { // if player is in an org owning event
                req.body.player.addedBy = req.user._id;
                event.flights[req.body.flight].players.push(req.body.player);
                var result = yield csp.take(persist.saveModel(event));
                if (result instanceof Error) {
                    res.status(500).json({error: "Cannot add player"});
                } else {
                    res.status(200).json({status: "Success"})
                }
            } else {
                res.status(405).json({error: 'you must be in the org sponsoring the event'});
            }
        }
    });
});


router.patch('/movePlayer', function (req, res, next) {
    csp.go(function* () {
        var event = yield csp.take(persist.getModelById(events.Event, req.body.event));
        if (event instanceof Error) {
            res.status(404).json(event);
            return;
        }
        if(!playerInFlight(event.flights[req.body.fromFlight].players, req.body.player)) {
            res.status(405).json({error: "Player not in flight"});
            return;
        }
        if(!(event.flights[req.body.toFlight] && event.flights[req.body.fromFlight])) {
            res.status(405).json({error: "Illegal from or to flight"});
            return;
        }
        if(!(authorizedEventUpdate(req.user, req.body.player))) {
            res.status(405).json({error: "You can only move yourself or someone you added"});
            return;
        }
        if(playerInFlight(event.flights[req.body.toFlight].players, req.body.player)) {
            res.status(405).json({error: "Player already in flight"});
            return;
        }
        if(event.flights[req.body.toFlight].players.length < event.flights[req.body.toFlight].maxPlayers)
            event.flights[req.body.toFlight].players.push(findPlayerInFilght(event.flights[req.body.fromFlight].players, req.body.player));
        else {
            res.states(405).json({error: "flight is full"});
            return;
        }
        event.flights[req.body.fromFlight].players = removePlayerFromFlight(event.flights[req.body.fromFlight].players, req.body.player);
        var result = yield csp.take(persist.saveModel(event));
        if(result instanceof Error) {
            res.status(500).json(result);
        } else {
            res.status(200).json(result);
        }
    });
});


router.get('/getCurrentUser', function(req, res, next) {
    res.status(200).json({name: req.user.name, id: req.user._id})
});

router.get('/getAllPlayers', function (req, res, next) {
    csp.go(function*() {
        result = yield csp.take(persist.getAllPlayersNameAndId(players.Player)); // don't send password, etc to client
        if (result instanceof Error)
            res.status(500).json(result);
        else {
            console.log(result);
            res.status(200).json(result);
        }
    });
});


module.exports = router;

