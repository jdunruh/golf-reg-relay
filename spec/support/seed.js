var events = require('../../models/event-model.js');
var players = require('../../models/player-model.js');
var organizations = require('../../models/organization-model');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var moment = require('moment');

var mongoURI = process.env.MONGOLAB_URI || 'localhost';
mongoose.connect(mongoURI + '/golf-reg');


var org = new organizations.Org;
org.name = 'Up The Creek Ski and Recreation Club';
var org1 = new organizations.Org;
org1.name = 'Striker Golf League';
var player = new players.Player;
player.email = 'abc@example.com';
player.name = 'Steve Petersen';
player.password = '12345678';
player.registered = true;
player.organizations = [org._id];
var player1 = new players.Player;
player1.email = 'def@example.com';
player1.name = 'Joe Buchman';
player1.password = '12345678';
player1.registered = true;
player1.organizations = [org._id, org1._id];
var player2 = new players.Player;
player2.email = 'ghi@exapmle.com';
player2.name = 'Barb Burns';
player2.password = '12345678';
player2.registered = true;
player2.organizations = [org._id];
var player3 = new players.Player;
player3.email = 'jkl@example.com';
player3.name = 'Mary Contrary';
player3.password = '12345678';
player3.registered = true;
player3.organizations = [org1._id];
var player4 = new players.Player;
player4.email = 'mno@example.com';
player4.name = 'Larry Mayka';
player4.password = '12345678';
player4.organizations = [org1._id];
player4.registered = true;
var event = new events.Event;
event.name = "Monday Night Golf";
event.location = "Willis Case";
event.date = moment().add(1, 'days');
event.organizations = [org];
event.flights = [
    {
        time: moment(event.date).add(1,  'hours'),
        players: [],
        maxPlayers: 4
    },
    {
        time: moment(event.date).add(1, 'hours').add(15, 'minutes'),
        players: [],
        maxPlayers: 4
    }
];
var event1 = new events.Event;
event1.name = "Striker Monday League";
event1.location = "Striker Golf, Wheat Ridge";
event1.date = moment().add(2, 'days');
event1.organizations = [org];
event1.flights = [
    {
        time: moment(event1.date).add(1,  'hours'),
        players: [],
        maxPlayers: 4
    },
    {
        time: moment(event1.date).add(1, 'hours').add(15, 'minutes'),
        players: [],
        maxPlayers: 4
    }
];
var event2 = new events.Event;
event2.name = "Indian Hill Golf League";
event2.location = "Country Lakes";
event2.date = moment().add(3, 'days');
event2.organizations = [org1];
event2.flights = [
    {
        time: moment(event2.date).add(1,  'hours'),
        players: [],
        maxPlayers: 2
    }
];

organizations.Org.remove({})
.then(function() {
    return players.Player.remove({});
}).then(function(){
    return events.Event.remove({});
}).then(function() {
    return org.save();
}).then(function () {
    return org1.save();
}).then(function () {
    player.organizations = [org._id];
    return player.save();
}).then(function () {
    player1.organizations = [org._id, org1._id];
    return player1.save();
}).then(function () {
    player2.organizations = [org._id];
    return player2.save();
}).then(function () {
    player3.organizations = [org1._id];
    return player3.save();
}).then(function () {
    player4.organizations = [org1._id];
    return player4.save();
}).then(function () {
    org.organizers = [player1._id, player2._id];
    return org.save();
}).then(function () {
    org1.organizers = [player3._id];
    return org.save();
}).then(function () {
    event.organizers = [player1._id];
    event.organizations = [org._id];
    return event.save();
}).then(function () {
    event1.organizers = [player1._id, player3._id];
    event1.organizations = [org1._id];
    return event1.save();
}).then(function () {
        event2.organizers = [player._id];
        event2.organizations = [org1._id];
    return event2.save();
}).then(function() {
        process.exit();
});


