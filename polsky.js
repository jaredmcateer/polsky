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
    LPAREN = '(',
    RPAREN = ')',
    LEFT = 0,
    RIGHT = 1;

/**
 * Infix Parser
 *
 * This parser will convert an expression in infix notation to an abstract syntax tree 
 * and is capable of printing the function in prefix notation
 *
 * @param String expression to be parsed. Each token must be separated by a space (e.g., ( 1 + 3 ) * 8 )
 *
 * @return Object containing available functions to preform with the expression
 */
Parser = function (expr) {
    var tokens,
        that = this;

    tokens = expr.replace(/\s{2,}/g, ' ').split(' ');

    this.stack  = new Stack();
    this.output = new Stack();
    this.ast = null;
    this.reduce = false;

    return {
        /**
         * #parse() - Parses the expression into an abstract syntax tree
         *
         * @return The Abstract Syntax Tree
         */
        parse: function (reduce) {
            that.reduce = reduce;
            return that.parse(tokens);
        },

        /**
         * Formats the expression into a human readable format
         *
         * @param boolean reduce Optional. If true the equation will attempt simple reduction
         * @return the string of the formatted expression in prefix notation
         */
        print: function (reduce) {
            that.reduce = reduce;

            return that.print(that.parse(tokens));
        },
        
        levelNode: function(node) {
            return that.levelNode(node);

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
                var gcd = (function getGcd(num, dem) {
                        return dem ? getGcd(dem, num % dem) : num;
                    }(a, b)),
                    retVal;

                retVal = a / b;

                if (retVal % 1 !== 0) {
                    retVal = [a/gcd, b/gcd];
                }

                return retVal;
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
        var node, left, right;
        while (tokens.length) {
            this.processToken(tokens.shift());
        }

        // If there is anything left on the stack pop them into the output.
        while (this.stack.length) {
            right = this.output.pop();
            left = this.output.pop();
            node = this.makeNode(this.stack.pop(), [].concat(left, right));
            this.output.push(node);
        }

        this.ast = this.output.pop();

        return this.ast;
    },

    /**
     *  Processes an indvidual token
     *
     *  @param string token
     */
    processToken: function (token) {
        var op1, op2, node, right, left;

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
                    right = this.output.pop();
                    left = this.output.pop();
                    node = this.makeNode(this.stack.pop(), [].concat(left, right));
                    this.output.push(node);
                } else {
                    break;
                }
            }

            this.stack.push(token);

        } else if (token === LPAREN) {
            this.stack.push(token);

        } else if (token === RPAREN) {
            while (this.stack.length && this.stack.top() !== LPAREN) {
                right = this.output.pop();
                left = this.output.pop();
                node = this.makeNode(this.stack.pop(), [].concat(left, right));
                this.output.push(node);
            }

            if (this.stack.top() === LPAREN) {
                this.stack.pop();
            } else {
                throw new Error ('Mismatched Parens');
            }
        } else {
            throw new Error('Invalid token');
        }
    },

    /**
     * Makes a node for structuring the Abstract Syntax Tree
     *
     * @param string The operator in the node
     * @param array leaves the leaf nodes of this node
     * @return The node object
     */
    makeNode: function (op, leaves) {
        var node = {
                operator: op,
                leaves: leaves
            };

        if (this.reduce) {
            node = this.reducer(node);
        }

        return node;
    },

    /**
     * Attempts to simplify the Abstract Syntax Tree as much as possible
     *
     * @param object node the node to be reduced
     * @return object the reduced node.
     */
    reducer: function (node) {
        var leaves = node.leaves;

        switch (node.operator) {
            case '-':
                node.operator = '+';
                node.leaves[1] = this.makeNode('*', [].concat('-1', leaves[1]));
                break;
            case '+':
                node = this.levelNode(node);
                break;
            case '*':
                node = this.simplifyMultiplication(node);
                node = this.levelNode(node);
                break;
            case '/':
                node = this.simplifyDivision(node);
                break;
            default:
                break;
        }

        return node;
    },

    /**
     * Levels a node if the the sub-nodes contain similar operations that
     * are left/right agnostic.
     *
     * @param object node the node to level out
     * @return object the node with leveled out leaves
     */
    levelNode: function (node) {
        var leaves = [],
            leafNode,
            i;

        for (i = 0; i < node.leaves.length; i += 1) {
            leafNode = node.leaves[i];

            if (
                leafNode.hasOwnProperty('operator') && 
                node.operator === leafNode.operator
            ) {
                leaves = leaves.concat(this.levelNode(leafNode));
            } else {
                leaves.push(leafNode);
            }
        }

        node.leaves = leaves;

        return node;
    },

    /**
     * Attempts to simplify division by removing any nested division nodes and 
     * converts the sub-expression to use multiplication
     *
     * @param object node The node to simplified
     * @return object node The simplified node
     */
    simplifyDivision: function (node) {
        var left = node.leaves[0] || {},
            right = node.leaves[1] || {},
            tmpNode;

        if (
            this.nodeHasOperator(node, '/') &&
            this.nodeHasOperator(left, '/') &&
            !this.nodeHasOperator(right, '/')
        )  {
            node.leaves[0] = left.leaves[0];
            node.leaves[1] = this.makeNode('*', [].concat(left.leaves[1], right));
        }
        if (
            this.nodeHasOperator(node, '/') &&
            this.nodeHasOperator(right, '/') &&
            !this.nodeHasOperator(left, '/')
        ) {
            node.leaves[0] = this.makeNode('*', [].concat(left, right.leaves[0]));
            node.leaves[1] = right.leaves[1];
        }
        return node;
    },

    /**
     * Attempts to simplify any multiplication with disivision sub-nodes
     *
     * @param object node the node to simplify
     * @return object node the simplified node
     */
    simplifyMultiplication: function (node) {
        var i = 0,
            leafNode;

        for (i = 0; i < node.leaves.length; i += 1) {
            leafNode = node.leaves[i];

            if (this.nodeHasOperator(leafNode, '/')) {
                node = this.makeNode('/', [].concat(
                            this.makeNode('*', [].concat(
                                node.leaves.slice(0,i),
                                node.leaves.slice(i+1),
                                leafNode.leaves[0]
                            )),
                            leafNode.leaves[1]
                       ));

                // We only care about the first occurance of a division node
                break;
            }
        }

        return node;
    },

    /**
     * Checkes if the node has an operator property equal to the second parameter
     *
     * @param mixed The node to check
     * @param string the operator to check on the node
     * @return boolean
     */
    nodeHasOperator: function (node, operator) {
        return (node && node.hasOwnProperty('operator') && node.operator === operator);
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
     * @return string the formatted string
     */
    print: function (node) {
        var str,
            left,
            right,
            i;

        if (typeof node === 'string') {
            str = node;
        } else {
            str = '(' + node.operator;
            for (i = 0; i < node.leaves.length; i += 1) {
                str += ' ' + this.print(node.leaves[i]);
            }
            str += ')';
        }

        return str;
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
