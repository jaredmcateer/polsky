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
                var retVal = [a, b];

                if (!isNaN(a) && !isNaN(b)) {
                    retVal = parseInt(a, 10) + parseInt(b, 10);
                    retVal = [retVal.toString()];
                }

                return retVal; 
            } 
        },
        '-': { 
            weight: 2, 
            assoc: LEFT,
            method: function (a, b) {
                var retVal = [a, b];

                if (!isNaN(a) && !isNaN(b)) {
                    retVal = parseInt(a, 10) - parseInt(b, 10);
                    retVal = [retVal.toString()];
                }

                return retVal; 
            }
        },
        '*': { 
            weight: 3, 
            assoc: LEFT,
            method: function (a, b) {
                var retVal = [a, b];

                if (!isNaN(a) && !isNaN(b)) {
                    retVal = parseInt(a, 10) * parseInt(b, 10);
                    retVal = [retVal.toString()];
                }

                return retVal; 
            }
        },
        '/': { 
            weight: 3, 
            assoc: LEFT,
            method: function (a, b) {
                var gcd = function getGcd(num, dem) {
                        return dem ? getGcd(dem, num % dem) : num;
                    },
                    retVal = [a, b];
                
                if (!isNaN(a) && !isNaN(b)) {
                    a = parseInt(a, 10);
                    b = parseInt(b, 10);

                    retVal = [a / b];

                    if (retVal[0] % 1 !== 0) {
                        gcd = gcd(a, b);
                        a = (a/gcd).toString();
                        b = (b/gcd).toString();
                        retVal = [a, b];
                    }
                }

                return retVal;
            }
        },
        '^': { 
            weight: 4, 
            assoc: RIGHT,
            method: function (a, b) {
                var retVal = [a, b];

                if (!isNaN(a) && !isNaN(b)) {
                    retVal = [Math.pow(parseInt(a, 10), parseInt(b, 10)).toString()];
                }

                return retVal;
            }
        }
    } ,

    /**
     * Parses an expression
     *
     * @param array tokens the tokens to be parsed in infix notation order
     */
    parse: function (tokens) {
        var node, tmpAst;
        while (tokens.length) {
            this.processToken(tokens.shift());
        }

        // If there is anything left on the stack pop them into the output.
        while (this.stack.length) {
            this.createNodeFromStack();
        }

        this.ast = this.output.pop();
        
        if (this.reduce) {
            // Keep iterating until the tree doesn't change
            do {
                tmpAst = JSON.stringify(this.ast);
                this.ast = this.reducer(this.ast);
            } while (tmpAst !== JSON.stringify(this.ast));
        }

        return this.ast;
    },

    /**
     *  Processes an indvidual token
     *
     *  This is where the meat of the Shunting Yard Algorithm takes place
     *  See top of file for more detailed explanation of the algorithm
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
                    this.createNodeFromStack();
                } else {
                    break;
                }
            }

            this.stack.push(token);

        } else if (token === LPAREN) {
            this.stack.push(token);

        } else if (token === RPAREN) {
            while (this.stack.length && this.stack.top() !== LPAREN) {
                this.createNodeFromStack();
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
     * Helper function for the SYA.
     *
     * Pops the right and left nodes of an expression off the output array
     * as well as the top operator of the operator stack and creates a new
     * node which is then pushed back onto the output array.
     *
     */
    createNodeFromStack: function () {
        var right = this.output.pop(),
            left = this.output.pop(),
            node = this.makeNode(this.stack.pop(), [].concat(left, right));

        this.output.push(node);
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

        return node;
    },

    /**
     * Attempts to simplify the Abstract Syntax Tree as much as possible
     *
     * Sometimes these simplifications appear more complex largely due to
     * the algorithm attempting to remove as much subtraction and division
     * where possible. Multiplication and addition are preferred because 
     * they are agnostic to what is to the left and right of the operator
     * as well as having the potential to be flattened to make the tree a
     * little bit more compact.
     *
     * @param object node the node to be reduced
     * @return object the reduced node.
     */
    reducer: function (node) {
        var leaves = node.leaves,
            i;

        switch (node.operator) {
            case '-':
                node.operator = '+';
                node.leaves[1] = this.makeNode('*', [].concat('-1', leaves[1]));
                break;
            case '+':
                node.leaves = this.levelNode(node);
                node.leaves = this.combineLikeTerms(node);
                break;
            case '*':
                node = this.simplifyMultiplication(node);
                node.leaves = this.levelNode(node);
                node.leaves = this.combineLikeTerms(node);
                break;
            case '^':
                node.leaves = this.operators[node.operator].method(node.leaves[0], node.leaves[1]);
                break;
            case '/':
                node = this.simplifyDivision(node);
                break;
            default:
                break;
        }

        if (node.hasOwnProperty('leaves')) {
            if (node.leaves.length === 1) {
                node = node.leaves[0];
            } else {
                for (i = 0; i < node.leaves.length; i += 1) {
                    if (node.leaves[i].hasOwnProperty('operator')) {
                        node.leaves[i] = this.reducer(node.leaves[i]);
                    }
                }
            }
        }
        return node;
    },

    /**
     * Will attempt to combine like terms to reduce the occurances of 
     * parameters and numbers.
     *
     * @param object node The node to combine terms from
     * @return mixed returns the leaves of the node passed in or if possible the
     *               single integer that resulted in the combination of terms.
     */
    combineLikeTerms: function (node) {
        var i,
            leafNode,
            numberTotal = null,
            subExprs = [],
            tmpLeaves = [],
            subLeaves = [],
            vars = {};

        if (this.nodeHasOperator(node, '+') || this.nodeHasOperator(node, '*')) {
            for (i = 0; i < node.leaves.length; i += 1) {
                leafNode = node.leaves[i];

                // Leaf node is a number
                if (!isNaN(leafNode)) {
                    numberTotal = this.combineLikeNumbers(numberTotal, leafNode, node.operator);

                // Leaf node is a variable
                } else if (!leafNode.hasOwnProperty('operator')) {
                    vars = this.combineLikeVariables(vars, leafNode);

                // Leaf node is a sub-expression attempt to combine its terms
                } else {
                    subLeaves = this.combineLikeTerms(leafNode);
                    if (subLeaves.length === 1) {
                        tmpLeaves.push(subLeaves[0]);
                    } else {
                        subExprs.push(leafNode);
                    }
                }
            }

            if (numberTotal !== null) {
                tmpLeaves.push(numberTotal.toString());
            }
            
            tmpLeaves = tmpLeaves.concat(this.mergeVariables(vars, node.operator));

            if (subExprs.length > 0) {
                tmpLeaves = tmpLeaves.concat(subExprs);
            }
        }

        if (tmpLeaves.length > 0) {
            return tmpLeaves;
        }

        return node.leaves;
    },

    /**
     * Helper function to combine like numbers
     *
     * @param Number a the running total to apply the new number to
     * @param Number b the new number to apply to the running total
     * @param String operator the method of applying b to a
     * @return Number returns the result of the operation
     */
    combineLikeNumbers: function (a, b, operator) {
        a = parseInt(a, 10);
        b = parseInt(b, 10);

        if (isNaN(a)) {
            a = b;
        } else {
            a = this.operators[operator].method(a, b);
        }

        return a;
    },

    /**
     * Keeps a running total of like variables found in an equation
     *
     * @param object vars A keyed objects containing variables and their count
     * @param string variable the variable to add to the vars object
     * @return object returns the updated vars object
     */
    combineLikeVariables: function(vars, variable) {
        if (!vars.hasOwnProperty(variable)) {
            vars[variable] = 0;
        }

        vars[variable] += 1;

        return vars;
    },

    /**
     * Helper function to combine like variables
     *
     * @param obj vars A keyed object of variables and the instances they were found in the parent node
     * @param string currOp the current operator of the parent node, used to determine how to combine vars
     * @return array Returns an array of variables that have been combine if multiple instances were found
     */
     mergeVariables: function (vars, currOp) {
        var retVal = [],
            newOp = '^',
            key;

            for (key in vars) { if (vars.hasOwnProperty(key)) {
                if (vars[key] > 1) {
                    // Combine variable terms
                    if (currOp === '+') {
                        newOp = '*';
                    }

                    retVal.push(this.makeNode(newOp, [key, vars[key].toString()]));

                } else {
                    retVal.push(key);
                }
            }}

        return retVal;
    },

    /**
     * Levels a node if the the sub-nodes contain similar operations that
     * are left/right agnostic.
     *
     *              *                      *
     *             / \                  ┌─┬┴┬─┐
     *            a   *     -->         a b c d
     *               / \
     *              *   d
     *             / \
     *            b   c
     *
     * @param object node the node to level out
     * @return object the leveled out leaves of the node
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

        return leaves;
    },

    /**
     * Attempts to simplify division by removing any nested division nodes and 
     * converts the sub-expression to use multiplication, if the two nodes are
     * numbers it will attempt to evaluate the expression, if a remander is detected
     * it will then attempt to simplify using the greatest common denominator
     *
     * Node has division sub-node on left side:
     *
     *             %               %
     *            / \             / \
     *           %   c    --->   a   *
     *          / \                 / \
     *         a   b               b   c
     *
     * Node has division sub-node on right side:
     *
     *             %               %
     *            / \             / \
     *           a   %    --->   *   c
     *              / \         / \    
     *             b   c       a   b    
     *
     *
     * @param object node The node to simplified
     * @return object node The simplified node
     */
    simplifyDivision: function (node) {
        var left = node.leaves[0] || {},
            right = node.leaves[1] || {},
            tmpNode;

        if (this.nodeHasOperator(node, '/')) {
            if ( this.nodeHasOperator(left, '/') && !this.nodeHasOperator(right, '/'))  {
                node.leaves[0] = left.leaves[0];
                node.leaves[1] = this.makeNode('*', [].concat(left.leaves[1], right));

            } else if (this.nodeHasOperator(right, '/') && !this.nodeHasOperator(left, '/')) {
                node.leaves[0] = this.makeNode('*', [].concat(left, right.leaves[0]));
                node.leaves[1] = right.leaves[1];

            } else if ( !isNaN(left) && !isNaN(right)) {
                node.leaves = this.operators[node.operator].method(left, right);
            }
        }

        return node;
    },

    /**
     * Attempts to simplify any multiplication with disivision sub-nodes
     * by move the division node above the multiplication node. No matter
     * how many nodes the multiplication node has it will only move the 
     * first division node.
     *
     * 
     *          *                %
     *         /|\              / \
     *        a d %    --->    *   c
     *           / \          /|\
     *          b   c        a d b
     *
     *
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
