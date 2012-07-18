# Polsky - Converts infix expressions to pre/postfix

Polsky is a tool for converting mathematical infix expressions into prefix notation (polish notation).

Currently the expressions are required to be a fairly strict format where they spaced out by at least one space per operand/operator.

e.g., `( 1 + 2 ) * 5`

The exposed api will provides the following methods:

* `#parse()` method which returns an Abstract Syntax Tree
* `#print([reduce])` - returns the expression as a string in Polish/Prefix notation.
    * Optionally when reduce is set to true the print formatter will attempt to reduce the function. If the expression is easily solvable it will return the evaluated expression result. Otherwise it will:
        * Attempt to reduce instance of Division/Subtraction in the tree as they increase complexity by needing to have their leaf nodes in left/right order
        * Attempt to flatten multiplication and addition nodes reducing the amount of sub nodes
        * Attempt to combine like terms in multiplication and addition will be condensed (e.g., a + a + a + a -> (* a 4) or a * a * a * a -> (^ a 4))

# Installation

`git clone git@bitbucket.org:jaredmcateer/polsky.git`

`npm install` - necessary for the command line script which relies on one external dependency.

You can either run through node, your own script or parse a file of expressions using:

`./prefixer.js expression_file`

`./prefixer.js -r expression_file`

prefixer.js takes `-r` or `--reduce` to reduce the format. prefixer only exposes the print portion of Polsky.
