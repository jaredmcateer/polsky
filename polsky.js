var Parser,
    Stack,
    LEFT = 0,
    RIGHT = 1;

exports.parse = function (expr) {
    var parser = new Parser(expr);

    console.log(parser.operandStack);
    return parser.operandStack;
};

Parser = function (expr) {
    var tokens = expr.split(' ');

    this.stack = new Stack();
    this.output = new Stack();

    this.parse(tokens);
};
Parser.prototype = {
    operators: {
        '+': { weight: 2, assoc: LEFT },
        '-': { weight: 2, assoc: LEFT },
        '*': { weight: 3, assoc: LEFT },
        '/': { weight: 3, assoc: LEFT },
        '^': { weight: 4, assoc: RIGHT }
    } ,
    parse: function (tokens) {
        var token = tokens[0],
            op1,
            op2;

        if (token.match(/[a-zA-Z0-9]/)) {
            this.output.push(token);
        } else if (this.isOperator(token)) {
            while (this.stack.length > 0 && this.isOperator(this.stack.top())) {
                op1 = this.operators[token];
                op2 = this.operators[this.stack.top()];
                if (
                    (op1.assoc === LEFT  && op1.weight <= op2.weight) || 
                    (op1.assoc === RIGHT && op1.weight <  op2.weight)
                ) {
                    this.output.push(this.stack.pop());
                    continue;
                }

                break;
            }

            this.output.push(token);
        }
    },
    isOperator: function (token) {
        return !!this.operators[token];
    }
};

// Simple stack piggy backing off of Array prototype
Stack = function () {};
Stack.prototype = [];
Stack.prototype.top = function () {
    return this[this.length - 1];
};
