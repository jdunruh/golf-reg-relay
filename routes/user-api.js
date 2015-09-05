/* API for the react UI */

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var common = require('./common');
var persist = require('../persist');
var csp = require('js-csp');
var ObjectId = mongoose.Schema.Types.ObjectId;


var events = require('../models/event-model');
var players = require('../models/player-model');

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

router.delete('/removeModel/', function(req, res, next) {
    var update = {$pull: {}}; // need to validate that the flight is legal
    update['$pull']["flights." + req.body.flight + ".players"] = req.body.player;
    events.Event.update({_id: req.body.event}, update, function(err, docs) {
        if(err) {
            res.status(500).json(err);
        } else {
            res.status(200).json(docs);
        }
    })
});

router.put('/addPlayer/', function(req, res, next) {
    var update = {$addToSet: {}}; // need to validate that the flight is legal
    update['$addToSet']["flights." + req.body.flight + ".players"] = req.body.player;
    events.Event.update({_id: req.body.event}, update, function(err, docs) {
        if(err) {
            res.status(500).json(err);
        } else {
            res.status(200).json(docs);
        }
    })
});

router.patch('/movePlayer/', function(req, res, next) {
    var update = {$pull: {}}; // need to validate that the flight is legal
    update['$pull']["flights." + req.body.fromFlight + ".players"] = req.body.player;
    events.Event.update({_id: req.body.event}, update, function(err, docs) {
        if(err) {
            res.status(500).json(err);
        } else {
            update = {$addToSet: {}}; // need to validate that the flight is legal
            update['$addToSet']["flights." + req.body.toFlight + ".players"] = req.body.player;
            events.Event.update({_id: req.body.event}, update, function(err, docs) {
                if(err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json(docs);
                }
            })
        }
    })
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

