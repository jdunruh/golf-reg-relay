
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var organizations = require('../models/organization-model');
var persist = require('../persist');
var csp = require('js-csp');
var players = require('../models/player-model');

var ObjectId = mongoose.Schema.Types.ObjectId;


router.get('/getAllOrganizations', function(req, res, next) {
    csp.go(function*() {
        var result = yield csp.take(persist.findModelByQuery(organizations.Org, {_id: {$in: req.user.organizations}}));
        if( result instanceof Error) {
            res.status(404).send();
        } else {
            console.log(result);
            res.status(200).json(result);
        }
    });
});



var validateOrg = function(org) {
    org.name = validator.trim(org.name);
    return !validator.isNull(org.name) &&
            org.organizers != [] &&
            org.organizers != null &&
            org.organizers != undefined;
    };
/*
//create
router.post('/', function (req, res, next) {
    var mappedErrors = validateForm(req);
    if (mappedErrors) {
        res.render('organizations/new.jade', {
            organization: {
                name: req.body.name,
            },
            errors: req.validationErrors(true)
        });
    }
    else {
        var org = new organizations.Org(req.body);
        csp.go(function*() {
            var overallOrg = yield csp.take(persist.findModelByQuery(players.Player, {name: "John Unruh"}));
            org.organizers.push(overallOrg[0]._id);
            var result = yield csp.take(persist.saveModel(org));
            if (result instanceof Error) {
                res.render('organizations/new.jade', {
                    organization: {
                        name: req.body.name
                    },
                    errors: {name: {msg: "could not save organization"}}
                })
            } else {
                res.redirect(302, '/organizations');
            }

        });
    }
});


//show
router.get('/:id', function(req, res, next) {
    csp.go(function*() {
        result = yield csp.take(persist.getModelById(organizations.Org, req.params.id));
        if(result instanceof Error) {
            res.status(404).send();
        } else {
            console.log(result);
            res.render('organizations/show.jade', {organization: result, errors:{}, referrer: req.get('Referrer')});
        }
    });
});

//update
router.post('/:id', function (req, res, next) {
    var mappedErrors = validateForm(req);
    if (mappedErrors)
        res.render('organizations/edit.jade', {
            organization: {
                name: req.body.name
            },
            errors: mappedErrors
        });
    else {
        var organization = new organizations.Org;
        csp.go(function*() {
            var result = yield csp.take(persist.getModelById(organizations.Org, req.params.id));
            if (result instanceof Error)
                res.redirect(302, '/organizations');
            else {
                organization.name = req.body.name;
                result = csp.take(persist.saveModel(organization));
                if (result instanceof Error)
                    res.redirect(302, '/organizations');
                else
                    res.redirect(302, '/organizations/' + req.params.id)
            }
        });
    }
});


//edit
router.get('/:id/edit', function(req, res, next) {
    csp.go(function*() {
        var result = yield csp.take(persist.getModelById(organizations.Org, req.params.id));
        if(result instanceof Error) {
            res.redirect(302, '/organizations');
        } else {
            console.log(result);
            res.render('organizations/edit.jade', {organization: result, errors: {}, referrer: req.get('Referrer')});
        }
    });
});



//delete
router.post('/:id/delete', function(req, res, next) {
    csp.go(function*() {
        var result = yield csp.take(persist.removeModel(organizations.Org, req.params.id));
        if (result instanceof Error) {
            res.status(404).send();
        } else {
            res.redirect(302, '/organizations');
        }
    });
});
*/
module.exports = router;


