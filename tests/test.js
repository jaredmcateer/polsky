var assert = require("assert");
var polsky = require("../polsky.js");

describe('Polsky', function () {
    describe('printing', function () {
        it('should print the formatted expression in human readable format', function () {
            assert.deepEqual(new polsky.Parser('3').print(), '3');
            assert.deepEqual(new polsky.Parser('1 + 1').print(), '(+ 1 1)');
            assert.deepEqual(new polsky.Parser('2 * 5 + 1').print(), '(+ (* 2 5) 1)');
            assert.deepEqual(new polsky.Parser('2 * ( 5 + 1 )').print(), '(* 2 (+ 5 1))');
            assert.deepEqual(new polsky.Parser('3 * x + ( 9 + y ) / 4').print(), '(+ (* 3 x) (/ (+ 9 y) 4))');
            assert.deepEqual(new polsky.Parser('3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3').print(), '(+ 3 (/ (* 4 2) (^ (- 1 5) (^ 2 3))))');
            assert.deepEqual(new polsky.Parser('3 / 9').print(), '(/ 3 9)');
            
        });
    });

    describe('printing with reduce flag set', function () {
        it('should print the formatted and reduced expression in human readable format', function () {
            assert.deepEqual(new polsky.Parser('3').print(true), '3');
            assert.deepEqual(new polsky.Parser('1 + 1').print(true), '2');
            assert.deepEqual(new polsky.Parser('2 * 5 + 1').print(true), '11');
            assert.deepEqual(new polsky.Parser('2 * ( 5 + 1 )').print(true), '12');
            assert.deepEqual(new polsky.Parser('3 * x + ( 9 + y ) / 4').print(true), '(+ (* 3 x) (/ (+ 9 y) 4))');
            assert.deepEqual(new polsky.Parser('3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3').print(true), '(+ 3 (/ 1 8192))');
            assert.deepEqual(new polsky.Parser('3 / 9').print(true), '(/ 1 3)');
        });
    });
});
