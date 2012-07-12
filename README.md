# Polsky - Converts infix expressions to pre/postfix

Polsky is a tool for converting mathematical infix expressions into prefix notation (polish notation).

Currently the expressions are required to be a fairly strict format where they spaced out by at least one space per operand/operator.

e.g., `1 + 2 * 5`

The exposed api will provides the following methods:

* `#parse()` method which returns an array in Postfix/Reverse Polish Notation
* `#convertToAst()` - returns the parsed expression in as an Abstract Syntax Tree object
* `#print([reduce])` - returns the expression as a string in Polish/Prefix notation.
** Optionally when reduce is set to true the print formatter will attempt to reduce the function. This is pretty simple and won't reduce division if the return value is not an integer nor will it perform alegbraic reductions

# Installation

`git clone git@bitbucket.org:jaredmcateer/polsky.git`
`npm install`

You can either run through node, your own script or parse a file of expressions using:

`./prefixer.js expression_file`

prefixer.js takes `-r` or `--reduce` to reduce the format. prefixer only exposes the print portion of Polsky.
