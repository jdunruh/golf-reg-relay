
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var csp = require('js-csp');
var players = require('./models/player-model');

module.exports = {
    newPlayer: function (inPlayer) { // channel gets player structure with data to save
        var ch = csp.chan();
        player = new players.Player(inPlayer)
        player.save(function (err, docs) {
            if (err)
                putAsync(channel, err);
            else
                putAsync(channel, docs);
        });
        return ch;
    },
    updatePlayer: function (inPlayer) { // channel gets player structure with _id and any fields to update
        var ch = chan();
        players.Player.findById(sentPlayer.id).exec()
            .then(function (player) {
                for (var p in inPlayer)
                    player[p] = inPlayer[p];
                player.save.exec();
            })
            .then(function (doc) {
                putAsync(channel, doc);
            })
            .onReject(function (err) {
                putAsync(channel, err);
            })
            .end();
        return ch;
    },
    removePlayer: function(channel) { // channel gets player _id
        var player = takeAsync(channel);
        players.Player.findByIdAndRemove(player, function (err, docs) {
            if (err) {
                putAsync(channel, err);
            } else {
                putAsync(channel, docs);
            }
        })
    },
    getPlayerById: function(channel) { // channel gets _id of player
        var player = takeAsync(channel);
        players.Player.findById(player, function(err,docs) {
            if(err)
                putAsync(channel, err);
            else
                putAsync(channel, docs);
        })
    },
    getPlayerByEmail: function(channel) { // channel gets email of player
        var email = takeAsync(channel);
        players.Player.find({email: email}, function(err, docs) {
          if(err)
            putAsync(channel, err);
          else
            putAsync(chonnel, docs);
        })
    },
    getAllPlayers: function() { // get all players
        var ch = csp.chan();
        players.Player.find({}, function(err, docs) {
            if(err)
                putAsync(ch, err);
            else
                putAsync(ch, docs)
        });
        return ch;
    }
};

