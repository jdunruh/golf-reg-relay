/* API for the react UI */

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;


var events = require('../models/event-model');



// seed database for testing purposes
/*var eventTestData = {
    date: 'Tuesday',
    location: 'Fossil Trace',
    flights: [
        {time: "10:20", players: ["Harry", "Sally", "Morrie"], maxPlayers: 4},
        {maxPlayers: 2, time: "10:26", players: ["Tommy", "Annie"]},
        {maxPlayers: 4, time: "10:32", players: []}]
};

var event = new events.Event(eventTestData);

events.Event.remove({}, function(err, result) {
    event.save();
});*/


router.get('/getAllEVents', function(req, res, next) {
    events.Event.find({}, null, { sort: { _id: 1 } }, function(err, docs) {
        if(err) {
            res.status(404).json(err);
        } else {
            res.status(200).json(docs);
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
    res.status(200).json({user: req.user.name, id: req.user._id})
});


module.exports = router;

