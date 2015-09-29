
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var csp = require('js-csp');
var ObjectId = mongoose.Schema.Types.ObjectId;


module.exports = {
    newModel: function (model, input) { // channel gets player structure with data to save
        var ch = csp.chan();
        var myModel = new model(input);
        myModel.save(function (err, docs) {
            if (err)
                csp.putAsync(ch, err);
            else
                csp.putAsync(ch, docs);
        });
        return ch;
    },
    updateModel: function (model, input) { // channel gets player structure with _id and any fields to update
        var ch = csp.chan();
        model.findById(input._id, function(err, doc) {
            if (err)
                csp.putAsync(err);
            else
                for (var p in input)
                    doc[p] = input[p];
            return doc.save(function (err, val) {
                if (err)
                    csp.putAsync(ch, err);
                else
                    csp.putAsync(ch, val);
            })
        });
        return ch;
    },
    removeModel: function(model, id) { // channel gets player _id
        var ch = csp.chan();
        model.findByIdAndRemove(id, function (err, docs) {
            if (err) {
                csp.putAsync(ch, err);
            } else {
                csp.putAsync(ch, docs);
            }
        });
        return ch;
    },
    getModelById: function(model, id) { // channel gets _id of player
        var ch = csp.chan();
        model.findById(id, function(err,docs) {
            if(err)
                csp.putAsync(ch, err);
            else if(docs === null)
                csp.putAsync(ch, new Error("nothing found"));
            else
                csp.putAsync(ch, docs);
        });
        return ch;
    },
    getPlayerByEmail: function(model, email) { // channel gets email of player
        var ch = csp.chan();
        model.find({email: email}, function(err, docs) {
          if(err)
            csp.putAsync(ch, err);
          else
            if(docs === null)
                csp.putAsync(ch, new Error("not found"));
            else
                csp.putAsync(ch, docs);
        });
        return ch;
    },
    getAll: function(model) { // get all players
        var ch = csp.chan();
        model.find({}, function(err, docs) {
            if(err)
                csp.putAsync(ch, err);
            else if(docs === null)
                csp.putAsync(new Error("nothing found"));
            else
                csp.putAsync(ch, docs)
        });
        return ch;
    },
    getAllPlayersNameAndId: function(model) {
        var ch = csp.chan();
        model.find({}, {name:1, _id:1}, function(err, players) {
            if(err)
                csp.putAsync(ch, err);
            else {
                csp.putAsync(ch, players);
                console.log(players);
            }
        });
        return ch;
    },
    getPlayerByToken: function(model,token) {
        var ch = csp.chan();
        model.find({resetToken: token}, function(err, docs) {
            if(err)
                csp.putAsync(ch, err);
            else if(docs === null)
                csp.putAsync(new Error("not found"));
            else
                csp.putAsync(ch, docs)
        });
        return ch;
    },
    saveModel: function(model) {
        var ch = csp.chan();
        model.save(function(err, result) {
            if(err) {
                csp.putAsync(ch, err);
            }
            else
                csp.putAsync(ch, result);
        });
        return ch;
    },
    findModelByQuery: function(model, query) {
        var ch = csp.chan();
        model.find(query, function(err, result) {
            if(err) {
                csp.putAsync(ch, err);
            }
            else
                csp.putAsync(ch, result);
        });
        return ch;
    }
};

