utils = require('../src/js/common/utils.js');
im = require('immutable');

describe("inTeeList", function () {
    var db = im.Map({flights: im.List.of(im.Map({time: "10:36", position: 0, players:
            im.Set([im.Map({name: "Joe"}), im.Map({name:"Billy Bob"}), im.Map({name: "Spike"}), im.Map({name: "Karen"})]), maxPlayers: 4}),
        im.Map({time: "10:42", position: 1,players: im.Set([im.Map({name: "Annie"}), im.Map({name: "Tommy"})]), maxPlayers: 4}),
        im.Map({time: "10:48", position: 2, players: im.Set([]), maxPlayers: 2}))});

    it("can determine if a player is currently not on the tee list", function () {

        expect(utils.inTeeList(db, im.Map({name: "Harry"}))).toBe(false);
    });
    it("can determine that a player is on the current tee time list", function(){
        expect(utils.inTeeList(db, im.Map({name: "Billy Bob"}))).toBe(true);
    });
});

describe("availableFlights", function() {
    var db = im.List.of(im.Map({time: "10:36", position: 0, players: im.Set(["Joe", "Billy Bob", "Spike", "Karen"]), maxPlayers: 4}),
        im.Map({time: "10:42", position: 1,players: im.Set(["Annie", "Tommy"]), maxPlayers: 4}),
        im.Map({time: "10:48", position: 2, players: im.Set([]), maxPlayers: 2}));

    it("returns an array of flights with availability", function() {

        expect(utils.availableFlights(db).getIn([0, "time"])).toEqual("10:42");
        expect(utils.availableFlights(db).getIn([1, "time"])).toEqual("10:48");
    });

    it("returns an empty array when all flights are full", function() {
        var db = im.List.of(im.Map({time: "10:36", position: 0, players: im.Set(["Joe", "Billy Bob", "Spike", "Karen"]), maxPlayers: 4}),
            im.Map({time: "10:42", position: 1,players: im.Set(["Annie", "Tommy"]), maxPlayers: 2}),
            im.Map({time: "10:48", position: 2, players: im.Set(["Ben", "Tammy"]), maxPlayers: 2}));

        expect(utils.availableFlights(db)).toEqual(im.List.of());
    });

    it("returns an empty array when the db is empty", function() {
        expect(utils.availableFlights(im.List.of())).toEqual(im.List.of());
    });
});

describe("flightFull", function () {
    var db = im.List.of(im.Map({time: "10:36", position: 0, players: im.Set(["Joe", "Billy Bob", "Spike", "Karen"]), maxPlayers: 4}),
        im.Map({time: "10:42", position: 1,players: im.Set(["Annie", "Tommy"]), maxPlayers: 4}),
        im.Map({time: "10:48", position: 2, players: im.Set([]), maxPlayers: 2}));

    it("can determine if a full flight is full", function () {
        expect(utils.flightFull(db.get(0))).toBe(true);
    });
    it("can determine that a flight that is not full is not full", function () {
        expect(utils.flightFull(db.get(1))).toBe(false);
    });
    it("can determine that an empty flight is not full", function () {
        expect(utils.flightFull(db.get(2))).toBe(false);
    });
});

describe("playerInFlight", function() {
    var db = im.List.of(im.Map({time: "10:36", position: 0, players:
            im.Set([im.Map({name: "Joe"}), im.Map({name: "Billy Bob"}), im.Map({name: "Spike"}), im.Map({name: "Karen"})]), maxPlayers: 4}),
        im.Map({time: "10:42", position: 1,players: im.Set([im.Map({name: "Annie"}), im.Map({name: "Tommy"})]), maxPlayers: 4}),
        im.Map({time: "10:48", position: 2, players: im.Set([]), maxPlayers: 2}));
    it("returns true if the player is in the flight", function() {
         expect(utils.playerInFlight(db.get(0), im.Map({name: "Joe"}))).toBe(true);
    });
    it("returns true if the player is in the flight", function() {
        expect(utils.playerInFlight(db.get(0), im.Map({name: "Annie"}))).toBe(false);
    });
});

describe("findTimes", function() {
    var db = im.Map({flights: im.List.of(im.Map({time: "10:36", position: 0, players:
            im.Set([im.Map({name: "Joe"}), im.Map({name: "Billy Bob"}), im.Map({name: "Spike"}), im.Map({name: "Karen"})]), maxPlayers: 4}),
    im.Map({time: "10:42", position: 1,players: im.Set([im.Map({name: "Annie"}), im.Map({name: "Tommy"})]), maxPlayers: 4}),
        im.Map({time: "10:48", position: 2, players: im.Set([]), maxPlayers: 2}))});
    it("returns the times available not including any the player is already in", function() {
        expect(utils.findTimes(db, im.Map({name: "Annie"})).getIn([0, "time"])).toEqual("10:48");
        expect(utils.findTimes(db, im.Map({name: "Trevor"})).getIn([0, "time"])).toEqual("10:42");
        expect(utils.findTimes(db, im.Map({name: "Trevor"})).getIn([1, "time"])).toEqual("10:48");
    });
});