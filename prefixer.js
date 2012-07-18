#!/usr/bin/env node

var cmdopt = require('cmdopt'),
    getOpts = new cmdopt.Parser(),
    opts,
    polsky = require('./polsky'),
    fs = require('fs'),
    fileName,
    reduce = false,
    purple = '\u001b[1;35m',
    yellow = '\u001b[1;33m',
    reset = '\u001b[0m';

getOpts.option('-h, --help', 'Show this.');
getOpts.option('-r, --reduce', 'Will attempt to reduce the equation when integer math is possible.');

try {
    opts = getOpts.parse(process.argv.slice(2));

    if (opts.help) {
        process.stdout.write(getOpts.help());
        process.exit();
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

fileName = process.argv.slice(2).pop();

if (!fileName) {
    process.stdout.write('Please provide a file to process\n');
    process.exit(1);
}

fs.exists(fileName, function (exists){
    if (!exists) {
        process.stdout.write('File not found: ' + fileName + '\n');
        process.exit(1);
    } else {
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
                    output = purple + expr + reset + ' -> ' + yellow + parser.print(reduce) + reset;
                } catch (e) {
                    process.stdout.write('Error encountered: ' + e.message + EOL);
                }

                process.stdout.write(output + EOL);
            });
        });
    }
});
