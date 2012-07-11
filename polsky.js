/**
 * Polsky: 
 *
 * Converts an Infix expression to Prefix notation 
 */
var Parser,
    Stack,
    LEFT = 0,
    RIGHT = 1;

/**
 * Parser
 *
 * @param string expr The infix expression to be converted, each operator and number must be separated by a space.
 * @return array an array ordered in (reverse) polish notion
 */
Parser = function (expr) {
    var tokens;

    tokens = expr.split(' ');

    this.stack = new Stack();
    this.output = new Stack();

    this.parse(tokens);

    return this.output.toArray();
};

Parser.prototype = {
    // list of operators and their weights
    operators: {
        '+': { weight: 2, assoc: LEFT },
        '-': { weight: 2, assoc: LEFT },
        '*': { weight: 3, assoc: LEFT },
        '/': { weight: 3, assoc: LEFT },
        '^': { weight: 4, assoc: RIGHT }
    } ,

    // Parse an expression.
    // TODO error checking
    parse: function (tokens) {
        while (tokens.length) {
            this.parseToken(tokens.shift());
        }

        // If there is anything left on the stack pop them into the output.
        while (this.stack.length) {
            this.output.push(this.stack.pop());
        }
    },

    parseToken: function (token) {
        var op1, op2;

        //token is a number or variable
        if (token.match(/[a-zA-Z0-9]/)) {
            this.output.push(token);

        } else if (this.isOperator(token)) {
            while (this.stack.length && this.isOperator(this.stack.top())) {
                op1 = this.operators[token];
                op2 = this.operators[this.stack.top()];

                if (
                    (op1.assoc === LEFT  && op1.weight <= op2.weight) || 
                    (op1.assoc === RIGHT && op1.weight <  op2.weight)
                ) {
                    this.output.push(this.stack.pop());
                } else {
                    break;
                }
            }

            this.stack.push(token);

        } else if (token === '(') {
            this.stack.push(token);

        } else if (token === ')') {
            while (this.stack.length && this.stack.top() !== '(') {
                this.output.push(this.stack.pop());
            }

            if (this.stack.top() === '(') {
                this.stack.pop();
            } else {
                throw new Error ('Mismatched Parens');
            }
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
Stack.prototype.toArray = function () {
    return Array.prototype.slice.call(this);
};

exports.Parser = Parser;
