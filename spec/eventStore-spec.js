im = require('immutable');
store = require('../src/js/stores/eventStore.js');

// global immutables used over many tests
    var flight1 = store.newFlight(4, "10:20", im.Set(["Harry", "Sally", "Morrie"]));
    var flight2 = store.newFlight(2, "1026", im.Set(["Tommy", "Annie"]));
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
        store.addPlayerToFlight(0, 0, "Karen");
        expect(store.getEventsFromStore().getIn([0, "flights", 0, "players"]).includes("Karen")).toBeTruthy();
    });

    it("cannot be added a second time", function() {
        store.addPlayerToFlight(0, 0, "Karen");
        expect(store.getEventsFromStore().getIn([0, "flights", 0, "players"]).includes("Karen")).toBeTruthy();
        expect(store.getEventsFromStore().getIn([0, "flights", 0, "players"]).filter(x => x === "Karen").size).toEqual(1);
    });

    it("cannot be added to a full flight", function() {
        store.addPlayerToFlight(0, 1, "Karen");
        expect(store.getEventsFromStore().getIn([0, "flights", 1, "players"]).includes("Karen")).toBeFalsy();
    });

    it("can be removed from the event", function() {
        store.removePlayerFromEvent(0, "Sally");
        expect(utils.inTeeList(store.getEventsFromStore().get(0), "Sally")).toBeFalsy();
    });
    it("can be moved to a different flight if it isn't full", function() {
        store.movePlayerToFlight(0, "Harry", 2);
        expect(store.getEventsFromStore().getIn([0, "flights", 2, "players"]).includes("Harry")).toBeTruthy();
    });
    it("cannot be moved to a full flight", function() {
        store.movePlayerToFlight(0, "Harry", 1);
        expect(store.getEventsFromStore().getIn([0, "flights", 1, "players"]).includes("Harry")).toBeFalsy();
        expect(store.getEventsFromStore().getIn([0, "flights", 0, "players"]).includes("Harry")).toBeTruthy();
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
        var fl1 = im.Map({maxPlayers: 4, players: im.Set([im.Map({name: 'abc', id:1234}), im.Map({name: 'def', id:2345})])});
        var fl2 = im.Map({maxPlayers: 2, players: im.Set([im.Map({name: 'abc', id:1234})])});
        var store = im.Map({events: im.List([im.Map({location: 'abc', flights: im.List([fl1, fl2])})])});
        expect(store.removePlayerFromEvent(0, im.Map({name: 'abc', id: 1234}));
    })
});