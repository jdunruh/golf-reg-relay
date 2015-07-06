const persist = require('../persist.js');
const csp = require('js-csp');
const players = require('../models/player-model');

describe("player", function() {
    it("can be saved", function () {
        var player = {
            email: "abc@example.com",
            name: "Bullwinkle Moose",
            registered: true,
            password: "asdbjkl;"
        };
        var data = {};
        csp.go(function*() {
            data = yield csp.take(persist.newPlayer(player));
            expect(data.email).toEqual(player.email);
            expect(data.name).toEqual(player.name);
            expect(data.registered).toBe(true);
            expect(data.password).not.toBe(null);
            expect(data.password).not.toEqual(player.password);
            expect(data.password.length).toBeGreaterThan(player.password.length);
            expect(data._id).not.toBe(null);
            players.Player.remove({_id: data.id});
        });
    });

    it("can be updated", function () {
        var player = {
            email: "abc@example.com",
            name: "Bullwinkle Moose",
            registered: true,
            password: "asdbjkl;"
        };
        var data = {};
        csp.go(function*() {
            data = yield csp.take(persist.newPlayer(player));
            data.name = "Yogi Bear";
            var data1 = yield csp.take(persist.updatePlayer(data));
            expect(data1.name).toEqual("Yogi Bear");
            expect(data.password).toEqual(data1.password);
            players.Player.remove({_id: data1.id});
        })
    });

    it("can change password", function () {
        var player = {
            email: "abc@example.com",
            name: "Bullwinkle Moose",
            registered: true,
            password: "asdbjkl;"
        };
        var data = {};
        csp.go(function*() {
            data = yield csp.take(persist.newPlayer(player));
            data.password = "Oh what a relief it is";
            var data1 = yield csp.take(persist.updatePlayer(data));
            expect(data1.name).toEqual("Yogi Bear");
            expect(data.password).not.toEqual(data1.password);
            players.Player.remove({_id: data1.id});
        })
    });

    it("can be removed", function() {
        var player = {
            email: "abc@example.com",
            name: "Bullwinkle Moose",
            registered: true,
            password: "asdbjkl;"
        };
        var data = {};
        csp.go(function*() {
            data = yield csp.take(persist.newPlayer(player));
            yield csp.take(persist.removePlayer(data._id));
            players.Player.findById(data._id, function(err, player) {
                expect(player).toEqual({});
            });
            players.Player.remove({_id: data.id});
        })
    });

    it("can be found by id", function() {
        var player = {
            email: "abc@example.com",
            name: "Bullwinkle Moose",
            registered: true,
            password: "asdbjkl;"
        };
        var data = {};
        csp.go(function*() {
            data = yield csp.take(persist.newPlayer(player));
            var data1 = yield csp.take(persist.getPlayerById((data._id)));
            expect(data.email).toEqual(data1.email);
            expect(data.name).toEqual(data1.name);
            expect(data._id).toEqual(data1._id);
            expect(data.password).toEqual(data1.password);
            players.Player.remove({_id: data1.id});
        });
    });

    it("can be found by email", function() {
        var player = {
            email: "abc@example.com",
            name: "Bullwinkle Moose",
            registered: true,
            password: "asdbjkl;"
        };
        var data = {};
        csp.go(function*() {
            data = yield csp.take(persist.newPlayer(player));
            var data1 = yield csp.take(persist.getPlayerByEmail((data.eamil)));
            expect(data.email).toEqual(data1.email);
            expect(data.name).toEqual(data1.name);
            expect(data._id).toEqual(data1._id);
            expect(data.password).toEqual(data1.password);
            players.Player.remove({_id: data1.id});
        });
    });

    it("can get all players", function() {
        var player = {
            email: "abc@example.com",
            name: "Bullwinkle Moose",
            registered: true,
            password: "asdbjkl;"
        };
        var data = {};
        csp.go(function*() {
            count = yield csp.take(persist.getAllPlayers()).count;
            data = yield csp.take(persist.newPlayer(player));
            data1 = yield csp.take(persist.newPlayer(player));
            count1 = yield csp.take(persist.getAllPlayers()).count;
            expect(count1 - count).toEqual(2);
            players.Player.remove({_id: data.id});
            players.Player.remove({_id: data1.id});
        });
    });

});
