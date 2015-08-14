aem = require('../routes/common.js');

describe('addErrorMessage', function() {

    it('can add an error message with a simple key', function() {
        expect(aem.addErrorMessage(['abc'], {param: 'abc', msg: 'it broke', val: 5}, {})).toEqual({abc: [{param: 'abc', msg: 'it broke', val: 5}]});
    });

    it('can a second error message with the same param' , function() {
        expect(aem.addErrorMessage(['abc'], {param: 'abc', msg: 'even more breakage', val: 8},
            aem.addErrorMessage(['abc'], {param: 'abc', msg: 'it broke', val: 5}, {}))).toEqual({abc: [{param: 'abc', msg: 'it broke', val: 5},
                                                                                                 {param: 'abc', msg: 'even more breakage', val: 8}]});
    });

    it('can a second error message with a different param' , function() {
        expect(aem.addErrorMessage(['abc'], {param: 'abc', msg: 'even more breakage', val: 8},
            aem.addErrorMessage(['def'], {param: 'def', msg: 'it broke', val: 5}, {}))).toEqual({def: [{param: 'def', msg: 'it broke', val: 5}],
                                                                                             abc: [{param: 'abc', msg: 'even more breakage', val: 8}]});
    });

    it('can add an error message with a composite key', function() {
        expect(aem.addErrorMessage('flight.1.xyz'.split('.'), {param: 'flight.1.xyz', msg: 'more breakage', val: 71}, {})).toEqual(
            {flight: {1: {xyz: [{param: 'flight.1.xyz', msg: 'more breakage', val: 71}]}}});
    });

    it('can add a second error message with the same composite key', function() {
        expect(aem.addErrorMessage('flight.1.xyz'.split('.'), {param: 'flight.1.xyz', msg: 'yet more breakage', val: 100},
            aem.addErrorMessage('flight.1.xyz'.split('.'), {param: 'flight.1.xyz', msg: 'more breakage', val: 71}, {}))).toEqual(
            {flight: {1: {xyz: [{param: 'flight.1.xyz', msg: 'more breakage', val: 71},
                {param: 'flight.1.xyz', msg: 'yet more breakage', val: 100}]}}});
    });

    it('can add a second error message with a different composite key', function(){
        expect(aem.addErrorMessage('flight.1.pqr'.split('.'), {param: 'flight.1.pqr', msg: 'yet more breakage', val: 100},
            aem.addErrorMessage('flight.1.xyz'.split('.'), {param: 'flight.1.xyz', msg: 'more breakage', val: 71}, {}))).toEqual(
                {flight: {1: {xyz: [{param: 'flight.1.xyz', msg: 'more breakage', val: 71}],
                             pqr: [{param: 'flight.1.pqr', msg: 'yet more breakage', val: 100}]}}});
    });

    it("can add an error message with a simple key and one with a composite key", function() {
        expect(aem.addErrorMessage(['abc'], {param: 'abc', msg: 'yet more breakage', val: 100},
            aem.addErrorMessage('flight.1.xyz'.split('.'), {param: 'flight.1.xyz', msg: 'more breakage', val: 71}, {}))).toEqual(
            {flight: {1: {xyz: [{param: 'flight.1.xyz', msg: 'more breakage', val: 71}]}}, abc: [{param: 'abc', msg: 'yet more breakage', val: 100}]})
    })
});