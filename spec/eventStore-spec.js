im = require('immutable');
store = require('../src/js/stores/eventStore.js');

// global immutables used over many tests
    var harry = im.Map({name: "Harry", _id: 1234});
    var sally = im.Map({name: "Sally", _id: 2345});
    var morrie = im.Map({name: "Morrie", _id: 3456});
    var tommy = im.Map({name: "Tommy", _id: 4567});
    var annie = im.Map({name: "Annie", _id: 5678});
    var karen = im.Map({name: "Karen", _id:6789});
    var flight1 = store.newFlight(4, "10:20", im.Set([harry, sally, morrie]));
    var flight2 = store.newFlight(2, "1026", im.Set([tommy, annie]));
    var flight3 = store.newFlight(4, "10:32", im.Set([]));

beforeEach(function() {
    store.resetStore();
    store.addEventToStore("Tuesday", "Fossil Trace", im.List.of(flight1, flight2, flight3));
});

describe("A Flight", function() {
    it("Can be created", function() {
        expect(store.newFlight(4, "10:20").get("time")).toEqual("10:20");
        expect(store.newFlight(4, "10:20").get("maxPlayers")).toEqual(4);
        expect(store.newFlight(2, "9:05").get("players").size).toEqual(0);
        expect(store.newFlight(2, "9:05", im.Set(["abc", "def"])).get("players")).toEqual(im.Set(["abc", "def"]));
    })
});

describe("An Event", function() {
   it("Can be created", function() {
       var event = store.newEvent("Tuesday", "Fossil Trace", im.List.of(flight1, flight2, flight3))
       expect(event.get("date")).toEqual("Tuesday");
       expect(event.get("location")).toEqual("Fossil Trace");
       expect(event.get("flights")).toEqual(im.List.of(flight1, flight2, flight3))
   });

    it("Can be added to the Store and then retrieved", function() {
        expect(store.getEventsFromStore().size).toEqual(1);
    });

    it("can be removed", function() {
        store.removeEventFromStore(0);
        expect(store.getEventsFromStore().size).toEqual(0);
    })
});

describe("A player", function() {
    store.resetStore();
    store.addEventToStore("Tuesday", "Fossil Trace", im.List.of(flight1, flight2, flight3));

    it("can be added to a flight", function() {
        store.addPlayerToFlight(0, 0, karen);
        expect(store.getEventsFromStore().getIn([0, "flights", 0, "players"]).includes(karen)).toBeTruthy();
    });

    it("cannot be added a second time", function() {
        store.addPlayerToFlight(0, 0, karen);
        expect(store.getEventsFromStore().getIn([0, "flights", 0, "players"]).includes(karen)).toBeTruthy();
        expect(store.getEventsFromStore().getIn([0, "flights", 0, "players"]).filter(x => x === karen).size).toEqual(1);
    });

    it("cannot be added to a full flight", function() {
        store.addPlayerToFlight(0, 1, karen);
        expect(store.getEventsFromStore().getIn([0, "flights", 1, "players"]).includes(karen)).toBeFalsy();
    });

    it("can be removed from the event", function() {
        store.removePlayerFromEvent(0, sally);
        expect(utils.inTeeList(store.getEventsFromStore().get(0), sally)).toBeFalsy();
    });
    it("can be moved to a different flight if it isn't full", function() {
        store.movePlayerToFlight(0, harry, 2);
        expect(store.getEventsFromStore().getIn([0, "flights", 2, "players"]).includes(harry)).toBeTruthy();
    });
    it("cannot be moved to a full flight", function() {
        store.movePlayerToFlight(0, "Harry", 1);
        expect(store.getEventsFromStore().getIn([0, "flights", 1, "players"]).includes(harry)).toBeFalsy();
        expect(store.getEventsFromStore().getIn([0, "flights", 0, "players"]).includes(harry)).toBeTruthy();
    });
});

describe("JSON Conversion - fromJSCustom", function() {
   it("can convert structures dumped from the internal data format (round trip)", function() {
       var events = store.getEventsFromStore();
      expect(store.fromJSCustom(events.toJS()) === events)
   })
});

describe("removePlayerFromFlight", function() {
    it("can remove a player", function() {
        var fl1 = im.Map({maxPlayers: 4, players: im.Set([im.Map({name: 'abc', _id:1234}), im.Map({name: 'def', _id:2345})])});
        var fl2 = im.Map({maxPlayers: 2, players: im.Set([im.Map({name: 'abc', _id:1234})])});
        store.store = im.Map({events: im.List([im.Map({location: 'abc', flights: im.List([fl1, fl2])})])});
        store.removePlayerFromEvent(0, im.Map({name: 'abc', _id: 1234}));
        expect(store.store.getIn(['events', 0, 'flights', 0]).includes(im.Map({name: 'abc', _id: 1234}))).toBeFalsy();
    })
});