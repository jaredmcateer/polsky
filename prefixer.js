#!/usr/bin/env node

var cmdopt = require('cmdopt'),
    getOpts = new cmdopt.Parser(),
    opts,
    polsky = require('./polsky'),
    fs = require('fs'),
    fileName = process.argv.pop(),
    reduce = false;

getOpts.option('-r, --reduce', 'will attempt to reduce the equation when integer math is possible.');

try {
    opts = getOpts.parse(process.argv.slice(2));
    if (opts.help) {
        process.stdout.write(getOpts.help());
    } else if (opts.r || opts.reduce) {
        reduce = true;
    }
} catch (optex) {
    if (optex instanceof cmdopt.ParseError) {
        process.stdout.write(optex.message + '\n');
        process.exit(1);
    }

    throw optex;
}

fs.readFile(fileName, 'utf8', function (err, data) {
    var EOL = data.indexOf("\r\n") >= 0 ? "\r\n" : "\n",
        lineEnd = new RegExp(EOL, 'g'),
        parser,
        lines;
        
    lines =data.split(lineEnd);
    lines.pop(); //drop last EOL

    lines.forEach(function(expr){
        var output = '';

        try {
            parser = new polsky.Parser(expr);
            output = expr + ' -> ' + parser.print(reduce);
        } catch (e) {
            process.stdout.write('Error encountered: ' + e.message + EOL);
        }

        process.stdout.write(output + EOL);
    });

});
