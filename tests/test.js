var assert = require("assert");
var polsky = require("../polsky.js");

describe('Polsky', function () {
    describe('printing', function () {
        it('should print the formatted expression in human readable format', function () {
            assert.deepEqual(new polsky.Parser('3').print(), '3');
            assert.deepEqual(new polsky.Parser('1 + 1').print(), '(+ 1 1)');
            assert.deepEqual(new polsky.Parser('2 * 5 + 1').print(), '(+ (* 2 5) 1)');
            assert.deepEqual(new polsky.Parser('2 * ( 5 + 1 )').print(), '(* 2 (+ 5 1))');
            assert.deepEqual(new polsky.Parser('2 * ( 5 / 1 )').print(), '(* 2 (/ 5 1))');
            assert.deepEqual(new polsky.Parser('3 * x + ( 9 + y ) / 4').print(), '(+ (* 3 x) (/ (+ 9 y) 4))');
            assert.deepEqual(new polsky.Parser('3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3').print(), '(+ 3 (/ (* 4 2) (^ (- 1 5) (^ 2 3))))');
            assert.deepEqual(new polsky.Parser('3 / 9').print(), '(/ 3 9)');
            assert.deepEqual(new polsky.Parser('a * b * c * d').print(), '(* (* (* a b) c) d)');
            assert.deepEqual(new polsky.Parser('a * a * b * c * c * c * d').print(), '(* (* (* (* (* (* a a) b) c) c) c) d)');
            assert.deepEqual(new polsky.Parser('a * ( b / c ) * ( d / e ) * f').print(), '(* (* (* a (/ b c)) (/ d e)) f)');
            assert.deepEqual(new polsky.Parser('( b / c ) * ( d / e ) * f * a').print(), '(* (* (* (/ b c) (/ d e)) f) a)');
            assert.deepEqual(new polsky.Parser('6 * 6 * ( 7 * 7 / 9 ) * ( 2 / 3 )').print(), '(* (* (* 6 6) (/ (* 7 7) 9)) (/ 2 3))');
            assert.deepEqual(new polsky.Parser('a * a * ( b * b / c ) * ( d / e )').print(), '(* (* (* a a) (/ (* b b) c)) (/ d e))');
            assert.deepEqual(new polsky.Parser('6 + 6 + ( ( 7 + 7 + 7 ) / 9 ) * ( 2 / 3 )').print(), '(+ (+ 6 6) (* (/ (+ (+ 7 7) 7) 9) (/ 2 3)))');
            assert.deepEqual(new polsky.Parser('( x ^ a ) * ( y ^ b ) * ( x ^ c )').print(), '(* (* (^ x a) (^ y b)) (^ x c))');
            
        });
    });

    describe('printing with reduce flag set', function () {
        it('should print the formatted and reduced expression in human readable format', function () {
            assert.deepEqual(new polsky.Parser('3').print(true), '3');
            assert.deepEqual(new polsky.Parser('1 + 1').print(true), '2');
            assert.deepEqual(new polsky.Parser('2 * 5 + 1').print(true), '11');
            assert.deepEqual(new polsky.Parser('2 * ( 5 + 1 )').print(true), '12');
            assert.deepEqual(new polsky.Parser('2 * ( 5 / 1 )').print(true), '10');
            assert.deepEqual(new polsky.Parser('3 * x + ( 9 + y ) / 4').print(true), '(+ (* 3 x) (/ (+ 9 y) 4))');
            assert.deepEqual(new polsky.Parser('3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3').print(true), '(+ (/ 1 8192) 3)');
            assert.deepEqual(new polsky.Parser('3 / 9').print(true), '(/ 1 3)');
            assert.deepEqual(new polsky.Parser('a * b * c * d').print(true), '(* a b c d)');
            assert.deepEqual(new polsky.Parser('a * a * b * c * c * c * d').print(true), '(* (^ a 2) (^ c 3) b d)');
            assert.deepEqual(new polsky.Parser('a * ( b / c ) * ( d / e ) * f').print(true), '(/ (* a f b d) (* e c))');
            assert.deepEqual(new polsky.Parser('( b / c ) * ( d / e ) * f * a').print(true), '(/ (* f a b d) (* e c))');
            assert.deepEqual(new polsky.Parser('6 * 6 * ( 7 * 7 / 9 ) * ( 2 / 3 )').print(true), '(/ 392 3)');
            assert.deepEqual(new polsky.Parser('a * a * ( b * b / c ) * ( d / e )').print(true), '(/ (* (^ a 2) (^ b 2) d) (* c e))');
            assert.deepEqual(new polsky.Parser('6 + 6 + ( ( 7 + 7 + 7 ) / 9 ) * ( 2 / 3 )').print(true), '(+ (/ 14 9) 12)');
            assert.deepEqual(new polsky.Parser('( x ^ a ) * ( y ^ b ) * ( x ^ c )').print(true), '(* (^ x a) (^ y b) (^ x c))');
        });
    });
});
