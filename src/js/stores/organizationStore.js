var im = require("immutable");
var utils = require('../common/utils');
var AppDispatcher = require('../dispatchers/AppDispatcher');
var appConstants = require('../constants/appConstants');
var objectAssign = require('react/lib/Object.assign');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');


var store = new im.List();
var storeById = new im.Map()

var resetStore = function() {
    store = new im.Map()
};

var getInitialDataFromServer = function () {
    $.ajax({
        dataType: "json",
        method: "get",
        url: window.location.origin + "/organization-api/getAllOrganizations",
        timeout: 3000
    }).done(function (data) {
        var temp = im.fromJS(data);
        store = temp;
        storeById = temp.reduce((acc, el) => acc.set(el.get('_id'), el), im.Map());
    }).fail(function (err) {
        console.log(err);
        alert("Initial Data Pull Failed. Try again later.");
    });
};


var addOrg = function(org) {
    $.ajax({
        dataType: "json",
        method: "put",
        contentType: "application/json",
        url: window.location.origin + "/api/addOrg",
        data: JSON.stringify(org),
        timeout: 3000
    }).done(function (data) {
        if(data.status != "already in store") {
            addOrganizationToStore(data);
            organizationStore.emit(appConstants.CHANGE_EVENT); // note this must be here so that the emit happens after the update
        }
    }).fail(function () {
        alert("Unable to update server. Try again later.");
    });
};

var addOrganizationToStore = function(org) {
    store = store.set(org.get('id'), org);
};

var removeOrg = function(orgId) {
    var org = store.find(x => x.get("_id") === orgId);
    if(!org) {
        $.ajax({
            dataType: "json",
            contentType: "application/json",
            method: "delete",
            url: window.location.origin + "/api/removeOrg",
            timeout: 3000,
            data: JSON.stringify({org: orgId})
        }).done(function (data) {
            removeOrgFromStore(orgId);
            organizationStore.emit(appConstants.CHANGE_EVENT); // note this must be here to ensure that the emit is after the server update
        }).fail(function (err) {
            alert("Unable to update server. Try again later.")
        });
    }
};

var removeOrgFromStore = function(orgId) {
    store = store.delete(orgId);
};


var updateOrg = function(org) {
    $.ajax({
        dataType: "json",
        contentType: "application/json",
        method: "patch",
        url: window.location.origin + "/api/updateOrg",
        timeout: 3000,
        data: JSON.stringify(org)
    }).done(function (data) {
        updateOrgInStore(org);
        organizationStore.emit(appConstants.CHANGE_EVENT); // note this must be here to ensure that the emit is after the server update
    }).fail(function (err) {
        alert("Unable to update server. Try again later.")
    });
};

var updateOrgInStore = function(org) {
    store = store.set(org.get('_id'), org);
};

var getOrgs = function() {
    return store;
};

var organizationStore = objectAssign({}, EventEmitter.prototype, {
    addChangeListener: function(cb){
        this.on(appConstants.CHANGE_EVENT, cb);
    },
    removeChangeListener: function(cb){
        this.removeListener(appConstants.CHANGE_EVENT, cb);
    },
    getInitialDataFromServer: getInitialDataFromServer,
    addOrg: addOrg,
    removeOrg: removeOrg,
    updateOrg: updateOrg,
    getOrgs: getOrgs,
    store: store
});

AppDispatcher.register(function(payload){
    var action = payload.action;
    switch(action.actionType){
        case appConstants.ADD_ORG:
            addOrg(action.data.organization);
            break;
        case appConstants.REMOVE_ORG:
            removeOrg(action.data.org);
            break;
        case appConstants.UPDATE_ORG:
            updateOrg(action.data.org);
            break;
        default:
            return true;
    }
});



module.exports = organizationStore;




