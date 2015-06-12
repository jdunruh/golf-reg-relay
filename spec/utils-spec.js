utils = require('../src/js/utils');

describe("determine if a player is already scheduled for a tee time", function () {
    it("can determine if a player is currently not on the tee list", function () {
        var db = [{time: "10:36", position: 0, players: ["Joe", "Billy Bob", "Spike", "Karen"], maxPlayers: 4},
            {time: "10:42", position: 1, players: ["Annie", "Tommy"], maxPlayers: 4},
            {time: "10:48", position: 2, players: [], maxPlayers: 2}];

        expect(utils.inTeeList(db, "Harry").toBe(false));
    });
    it("can determine that a player is on the current tee time list", function(){
        expect(utils.inTeeList(db, "Billy Bob").toBe(true));
    });
});

describe("find the flights with availability", function() {
    it("returns an array of flights with availability", function() {
        var db = [{time: "10:36", position: 0, players: ["Joe", "Billy Bob", "Spike", "Karen"], maxPlayers: 4},
            {time: "10:42", position: 1, players: ["Annie", "Tommy"], maxPlayers: 4},
            {time: "10:48", position: 2, players: [], maxPlayers: 2}];

        expect(utils.availableFlights(db).toEqual([{time: "10:42", position: 1, players: ["Annie", "Tommy"], maxPlayers: 4},
            {time: "10:48", position: 2, players: [], maxPlayers: 2}]
        ))
    });

    it("returns an empty array when all flights are full", function() {
        var db = [{time: "10:36", position: 0, players: ["Joe", "Billy Bob", "Spike", "Karen"], maxPlayers: 4},
            {time: "10:42", position: 1, players: ["Annie", "Tommy"], maxPlayers: 2},
            {time: "10:48", position: 2, players: ["Ben", "Tammy"], maxPlayers: 2}];
        expect(utils.availableFilghts(db).toEqual([]));
    });

    it("returns an empty array when the db is empty", function() {
        expect(utils.availableFlights([]).toEqual([]))
    });
});

describe("determine if a flight is full", function () {
    it("can determine if a full flight is full", function () {
        var db = [{time: "10:36", position: 0, players: ["Joe", "Billy Bob", "Spike", "Karen"], maxPlayers: 4},
            {time: "10:42", position: 1, players: ["Annie", "Tommy"], maxPlayers: 4},
            {time: "10:48", position: 2, players: [], maxPlayers: 2}];

        expect(flightFull(db[0]).toBe(true));
    });
    it("can determine that a flight that is not full is not full", function () {
        expect(utils.filghtFull(db[1]).toBe(false));
    });
    it("can determine that an empty flight is not full", function () {
        expect(utils.flightFull(db[2]).toBe(false));
    });
});