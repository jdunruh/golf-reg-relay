#!/usr/bin/env node --harmony


// API Definition
// get /messages - gets all messages on server
// get /messages/:id - gets messages newer than :id
// put /messages  {starred: [true|false], read: [true|false], labels: ["array", "of", "strings"]}
// delete /messages {ids: [array, of, ids] } - delete the emails identified in ids from database
// patch /messages {ids: [array, of, ids], starred]true|false\, read: [true|false] } set starred or read (if they are in the object) in the DB
// patch /messages/addLabel {ids: [array, of, ids], label: "label"} - add "label" to ids
// patch /messages/removeLabel {ids: [array, of, ids], label: "label"} - remove "label" from ids

'use strict';
const
    express = require('express'),
    app = express(),
    dbProps = ["subject", "read", "starred", "labels"],
    dbUpdateableProps = ["read", "starred"];

var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static('..'));
var Schema = mongoose.Schema;

var mongoURL = process.env.MONGOLAB_URI || 'localhost';


mongoose.connect(mongoURL, 'email');


var emailSchema = new Schema({
    subject: String,
    read: Boolean,
    starred: Boolean,
    labels: [String]
});


var updateEmailsInDB = function (req, res) {
    console.log(req.body);
    var updateProperties = {};
    var Email = mongoose.model('Email', emailSchema);

    Object.keys(req.body).forEach(function (propKey) {
        // make sure evildoer doesn't add illegal properties by sending them up in the JSON
        if (dbUpdateableProps.indexOf(propKey) > -1) {
            updateProperties[propKey] = req.body[propKey];
        }
    });
    console.log(updateProperties);
    Email.update({"_id": {$in: req.body.ids}}, {$set: updateProperties}, {multi: true}, function (err) {
        if(err) {
            res.status(404).json(err)
        } else {
            res.status(200).json({})}
    })
};

var updateLabelsInDB = function (req, res, method) {
    console.log(req.body);
    var Email = mongoose.model('Email', emailSchema);
    var query = (method === "addLabel") ? {$addToSet: {labels: {$each: req.body.labels}}} : {$pullAll: {labels: req.body.labels}};
    console.log(query)
    Email.update({"_id": {$in: req.body.ids}}, query, {multi: true}, function (err, raw) {
        if(err) {
            res.status(404).json(raw)
        } else {
            res.status(200).json({})}
    });
};


var removeEmailFromDB = function (req, res, id) {
    var Email = mongoose.model('Email', emailSchema);

    Email.remove({"_id": id}, function (err) {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(200).json({});
        }
    });
};

var removeEmailsFromDB = function (req, res, ids) { // ids is an array of IDs to delete
    var Email = mongoose.model('Email', emailSchema);

    Email.remove({"_id": {$in: ids}}, function (err) {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(200).json({});
        }
    });
};


var addEmailToDB = function (req, res) {
    // filter request keys by valid keys
    var validKeys = Object.keys(req.body).filter(function (propKey) {
        return dbProps.indexOf(propKey) > -1;
    });
    // if we don't have all the keys, it is an error
    if (validKeys.length < dbProps.length)
        return false;
    // reduce validKeys to object with valid keys and values from request
    var newDBEntry = validKeys.reduce(function (acc, key) {
        acc[key] = req.body[key];
        return acc;
    }, {});
    // put it into the DB
    var Email = mongoose.model('Email', emailSchema);
    var email = new Email;
     Email.create(newDBEntry, function(err) {
         if(err) {
             res.status(422).json({error: "Unable to Create Document"})
         } else {
             res.status(200).json({})
         }
     })
};

var retrieveAllEmail = function (req, res) {
    var Email = mongoose.model('Email', emailSchema);

    Email.find({}, null, { sort: { _id: 1 } }, function (err, result) {
         if(err) {
            res.status(404).json(err);
        } else {
            res.status(200).json(result);
        }
        });
 };

var retrieveEmailSince = function (req, res, lastId) {
    var Email = mongoose.model('Email', emailSchema);

    Email.where('_id').gt(lastId).exec(function (err, result) {
        if(err) {
            res.status(404).json(err);
        } else {
            res.status(200).json(result);
        }
    });
};

app.get('/messages', function (req, res) {
    retrieveAllEmail(req, res);
});

app.get('/messages/:lastId', function (req, res) {
    retrieveEmailSince(req, res, req.params.lastId);
});


app.patch('/messages', function (req, res) {
    updateEmailsInDB(req, res);
});

app.patch('/messages/:labelMethod', function(req, res) {
    updateLabelsInDB(req, res, req.params.labelMethod);
});


app.delete('/messages', function(req, res) {
    removeEmailsFromDB(req, res, req.body.ids)
});

app.delete('/messages/:id', function (req, res) {
    removeEmailFromDB(req, res, req.params.id);
});

app.put('/messages', function (req, res) {
    addEmailToDB(req, res)
});

app.listen(3000, function () {
    console.log("server up")
});
