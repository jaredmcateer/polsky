var assert = require("assert");
var polsky = require("../polsky.js");

describe('Polsky', function () {
    describe('parsing', function () {
        it('should return the expression in polish/prefix notation', function () {
            assert.deepEqual(new polsky.Parser('3').print(), '3');
            assert.deepEqual(new polsky.Parser('1 + 1').print(), '(+ 1 1)');
            assert.deepEqual(new polsky.Parser('2 * 5 + 1').print(), '(+ (* 2 5) 1)');
            assert.deepEqual(new polsky.Parser('2 * ( 5 + 1 )').print(), '(* 2 (+ 5 1))');
            assert.deepEqual(new polsky.Parser('3 * x + ( 9 + y ) / 4').print(), '(+ (* 3 x) (/ (+ 9 y) 4))');
            assert.deepEqual(new polsky.Parser('3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3').print(), '(+ 3 (/ (* 4 2) (^ (- 1 5) (^ 2 3))))');
        });
    });
});
