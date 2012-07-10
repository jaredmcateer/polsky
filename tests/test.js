var assert = require("assert");
var polsky = require("../polsky.js");

describe('Polsky', function () {
    describe('#parse()', function () {
        it('should an stack of operators and operands in polish/prefix notation', function () {
            assert.deepEqual(['+', '1', '1'], polsky.parse('( 1 + 1 ) * 5'));
        });
    });
});
