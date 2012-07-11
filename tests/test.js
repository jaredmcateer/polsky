var assert = require("assert");
var p = require("../polsky.js");

describe('Polsky', function () {
    describe('#parse()', function () {
        it('should return the expression in polish/prefix notation', function () {
            assert.deepEqual(['3'], new p.Parser('3'));
            assert.deepEqual(['1', '1', '+'], new p.Parser('1 + 1'));
            assert.deepEqual(['2', '5', '*', '1', '+'], new p.Parser('2 * 5 + 1'));
            assert.deepEqual(['2', '5', '1', '+', '*'], new p.Parser('2 * ( 5 + 1 )'));
            assert.deepEqual(['3', 'x', '*', '9', 'y', '+', '4', '/', '+'], new p.Parser('3 * x + ( 9 + y ) / 4'));
            assert.deepEqual(['3', '4', '2', '*', '1', '5', '-', '2', '3', '^', '^', '/', '+'], new p.Parser('3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3'));
        });
    });
});
