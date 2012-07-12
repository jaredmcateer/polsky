/**
 * Polsky: 
 *
 * Converts an Infix expression to Prefix notation 
 */
var Parser,
    Stack,
    NUMVAR = /[a-zA-Z0-9]/,
    OPERATOR = /[+\-*\/\^]/,
    LEFT = 0,
    RIGHT = 1;

/**
 * Parser
 *
 * @param string expr The infix expression to be converted, each operator and number must be separated by a space.
 * @return array an array ordered in (reverse) polish notion
 */
Parser = function (expr) {
    var tokens,
        that = this;

    tokens = expr.split(' ');

    this.stack = new Stack();
    this.output = new Stack();
    this.ast = null;

    this.parse(tokens);
    this.ast = this.convertToAst(that.output);

    return {
        // returns an array ordered in reverse polish notation
        parse: function () {
            return that.output.toArray();
        },

        // coverts RPN array to Abstract Syntax Tree
        convertToAst: function () {
            return that.ast;
        },

        // converts array to string with, unnecessary, parenthesis
        print: function () {
            return that.print(that.ast);
        }
    };
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

    /**
     * Parses an expression
     *
     * @param array tokens the tokens to be parsed in infix notation order
     * @TODO Error checking
     */
    parse: function (tokens) {
        while (tokens.length) {
            this.processToken(tokens.shift());
        }

        // If there is anything left on the stack pop them into the output.
        while (this.stack.length) {
            this.output.push(this.stack.pop());
        }
    },

    /**
     *  Processes an indvidual token
     *
     *  The token is processed using the Shunting Yard Algorithm:
     *
     *  If token is a number/variable
     *    add to output queue
     *  elIf token is an operator, op1, then
     *    while there is an operator, op2, at the top of the stack loop
     *      if op1 is left-associative and its precedence weight is <= that of op2
     *        OR op1 has precedence weight less than that of op2
     *          pop o2 off stack and push o2 onto output queue
     *    end loop
     *    push o1 onto stack
     *  elif token is left paren
     *    push on to stack
     *  elif token is right paren
     *    while operator, o1, at top of the stack is not the matching left paren
     *      pop o1 off stack and push it onto output queue
     *    endloop
     *
     *    if operator at top of stack is not the left paren
     *       error
     *    else 
     *      pop matching paren off stack and discard
     *  else
     *    error
     *  endif
     *
     *  @param string token
     */
    processToken: function (token) {
        var op1, op2;

        //token is a number or variable
        if (token.match(NUMVAR)) {
            this.output.push(token);

        } else if (token.match(OPERATOR)) {
            while (this.stack.length && this.stack.top().match(OPERATOR)) {
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

    /**
     * Converts an RPN array into an Abstract Syntax Tree
     *
     * @param array tokens the RPN array
     */
    convertToAst: function (tokens) {
        var token = tokens.pop();

        if (token.match(NUMVAR)) {
            return token;
        } else if (token.match(OPERATOR)) {
            return {
                operator: token,
                left: this.convertToAst(tokens),
                right:  this.convertToAst(tokens)
            };
        }
    },

    /**
     * Prints the AST in a human readable format
     *
     * When encountering a string it will immediately return the value
     * but if it encounters an object it will walk the object down the
     * right side first, then left side formatting the string in a readable 
     * format.
     *
     * @param object|string node The node to stringify
     */
    print: function (node) {
        if (typeof node === 'string') {
            return node;
        } else {
            return '(' + node.operator + ' ' + this.print(node.right) + ' ' + this.print(node.left) + ')'; 
        }
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
