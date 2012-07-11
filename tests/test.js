var assert = require("assert");
var polsky = require("../polsky.js");

describe('Polsky', function () {
    describe('parsing', function () {
        it('should return the expression in polish/prefix notation', function () {
            assert.deepEqual(new polsky.Parser('3'), ['3']);
            assert.deepEqual(['1', '1', '+'], new polsky.Parser('1 + 1'));
            assert.deepEqual(['2', '5', '*', '1', '+'], new polsky.Parser('2 * 5 + 1'));
            assert.deepEqual(['2', '5', '1', '+', '*'], new polsky.Parser('2 * ( 5 + 1 )'));
            assert.deepEqual(['3', 'x', '*', '9', 'y', '+', '4', '/', '+'], new polsky.Parser('3 * x + ( 9 + y ) / 4'));
            assert.deepEqual(['3', '4', '2', '*', '1', '5', '-', '2', '3', '^', '^', '/', '+'], new polsky.Parser('3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3'));
        });
    });

    describe('printing', function () {
        it('should print the parsed expression in readable form', function () {
            assert.equal(new polsky.Printer('1 + 1'), '(+ 1 1)');    
        });
    });
});
