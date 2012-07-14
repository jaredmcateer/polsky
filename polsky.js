/**
 * Polsky: 
 *
 * Converts an Infix expression to Prefix notation 
 *
 *  The tokens are processed using the Shunting Yard Algorithm:
 *
 *  Read Token
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
 *
 * @TODO Error checking
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

    tokens = expr.replace(/\s{2,}/g, ' ').split(' ');

    this.stack = new Stack();
    this.output = new Stack();
    this.ast = null;

    this.parse(tokens);

    return {
        // returns an array ordered in reverse polish notation
        parse: function () {
            return that.output[0];
        },

        /**
         * Formats the expression into a human readable format
         *
         * @param boolean reduce Optional. If true the equation will attempt simple reduction
         */
        print: function (reduce) {
            return that.print(that.ast, reduce);
        }
    };
};

Parser.prototype = {
    // list of operators and their weights and methods
    operators: {
        '+': { 
            weight: 2, 
            assoc: LEFT,
            method: function (a, b) {
                return a + b; 
            } 
        },
        '-': { 
            weight: 2, 
            assoc: LEFT,
            method: function (a, b) {
                return a - b;
            }
        },
        '*': { 
            weight: 3, 
            assoc: LEFT,
            method: function (a, b) {
                return a * b;
            }
        },
        '/': { 
            weight: 3, 
            assoc: LEFT,
            method: function (a, b) {
                return a / b;
            }
        },
        '^': { 
            weight: 4, 
            assoc: RIGHT,
            method: function (a, b) {
                return Math.pow(a, b);
            }
        }
    } ,

    /**
     * Parses an expression
     *
     * @param array tokens the tokens to be parsed in infix notation order
     */
    parse: function (tokens) {
        var node;
        while (tokens.length) {
            this.processToken(tokens.shift());
        }

        // If there is anything left on the stack pop them into the output.
        while (this.stack.length) {
            node = this.makeNode(this.stack.pop(), this.output.pop(), this.output.pop());
            this.output.push(node);
        }
    },

    /**
     *  Processes an indvidual token
     *
     *  @param string token
     */
    processToken: function (token) {
        var op1, op2, node;

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
                    node = this.makeNode(this.stack.pop(), this.output.pop(), this.output.pop());
                    this.output.push(node);
                } else {
                    break;
                }
            }

            this.stack.push(token);

        } else if (token === '(') {
            this.stack.push(token);

        } else if (token === ')') {
            while (this.stack.length && this.stack.top() !== '(') {
                node = this.makeNode(this.stack.pop(), this.output.pop(), this.output.pop());
                this.output.push(node);
            }

            if (this.stack.top() === '(') {
                this.stack.pop();
            } else {
                throw new Error ('Mismatched Parens');
            }
        } else {
            throw new Error('Invalid token');
        }
    },

    makeNode: function (op, right, left) {
        return {
            operator: op,
            left: left,
            right: right
        };
    },

    /**
     * Prints the AST in a human readable format
     *
     * When encountering a string it will immediately return the value
     * but if it encounters an object it will walk the object down the
     * right side first, then left side formatting the string in a readable 
     * format.
     *
     * @param mixed node The node to stringify
     * @param boolean reduce Optional. If true the expression will attempt reduction 
     * @return string the formatted string
     */
    print: function (node, reduce) {
        var str,
            left,
            right;

        if (reduce && typeof node !== 'string') {
            left = this.print(node.left, reduce);
            right = this.print(node.right, reduce);

            node.left = left;
            node.right = right;
            node = this.reduce(node);
        }

        if (typeof node === 'string') {
            str = node;
        } else {
            str = '(' + node.operator + ' ' + this.print(node.left) + ' ' + this.print(node.right) + ')'; 
        }

        return str;
    },

    /**
     * Extremely simple reduce
     *
     * This function will try an perform operation on values. If it end result is an integer
     * then it will return the value otherwise the entire node will be returned.
     *
     * @param object node the node in the ast to attempt reduction on
     * @return string|object
     */
    reduce: function (node) {
        if (!node.hasOwnProperty('operator')) { return node; }
        var left = parseInt(node.left, 10),
            right = parseInt(node.right, 10),
            opMethod = this.operators[node.operator].method,
            tmp,
            retVal = node;

        if (!isNaN(left) && !isNaN(right)) {
            tmp = opMethod(left, right);

            // Only return if evaluated return is an integer
            if (tmp % 1 === 0) {
                retVal = tmp.toString();
            }
        }

        return retVal;
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
