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
            data = yield csp.take(persist.newModel(players.Player, player));
            expect(data.email).toEqual(player.email);
            expect(data.name).toEqual(player.name);
            expect(data.registered).toBe(true);
            expect(data.password).not.toBe(null);
            expect(data.password).not.toEqual(player.password);
            expect(data.password.length).toBeGreaterThan(player.password.length);
            expect(data._id).not.toBe(null);
            players.Player.remove(players.Player, data._id);
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
            data = yield csp.take(persist.newModel(players.Player, player));
            data.name = "Yogi Bear";
            var data1 = yield csp.take(persist.updateModel(data));
            expect(data1.name).toEqual("Yogi Bear");
            expect(data.password).toEqual(data1.password);
            players.Player.remove(players.Player, data1._id);
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
            data = yield csp.take(persist.newModel(players.Player, player));
            data.password = "Oh what a relief it is";
            var data1 = yield csp.take(players.Player, persist.updateModel(players.Player, data));
            expect(data1.name).toEqual("Yogi Bear");
            expect(data.password).not.toEqual(data1.password);
            players.Player.remove(players.Player, data1._id);
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
            data = yield csp.take(persist.newModel(players.Player, player));
            yield csp.take(persist.removeModel(players.Player, data._id));
            players.Player.findById(data._id, function(err, player) {
                expect(player).toEqual({});
            });
            players.Player.remove(players.Player, data.id);
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
            data = yield csp.take(persist.newModel(players.Player, player));
            var data1 = yield csp.take(persist.getModelById(players.Player, data._id));
            expect(data.email).toEqual(data1.email);
            expect(data.name).toEqual(data1.name);
            expect(data._id).toEqual(data1._id);
            expect(data.password).toEqual(data1.password);
            players.Player.remove(players.Player, data1.id);
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
            data = yield csp.take(persist.newModel(players.Player, player));
            var data1 = yield csp.take(persist.getPlayerByEmail(players.Player, (data.eamil)));
            expect(data.email).toEqual(data1.email);
            expect(data.name).toEqual(data1.name);
            expect(data._id).toEqual(data1._id);
            expect(data.password).toEqual(data1.password);
            players.Player.remove(players.Player, data1.id);
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
            count = yield csp.take(persist.getAll(players.Player)).count;
            data = yield csp.take(persist.newModel(players.Player, player));
            data1 = yield csp.take(persist.newModel(players.Player, player));
            count1 = yield csp.take(persist.getAll(players.Player)).count;
            expect(count1 - count).toEqual(2);
            players.Player.remove(players.Player, data.id);
            players.Player.remove(players.Player, data1.id);
        });
    });

});
