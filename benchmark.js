#!/usr/bin/env node

var benchmark = require('benchmark'),
    suite = new benchmark.Suite(),
    polsky = require("./polsky.js");

suite.add('Parser#parse - 1 token:   ', function () {
    new polsky.Parser('3').parse();
}).

    add('Parser#parse - 3 tokens:  ', function () {
        new polsky.Parser('4 ^ 2').parse();
    }).

    add('Parser#parse - 5 tokens:  ', function () {
        new polsky.Parser('3 / 5 * 1').parse();
    }).

    add('Parser#parse - 7 tokens:  ', function () {
        new polsky.Parser('2 * ( 5 / 1 )').parse();
    }).

    add('Parser#parse - 9 tokens:  ', function () {
        new polsky.Parser('z + 3 * ( 8 - z )').parse();
    }).

    add('Parser#parse - 11 tokens: ', function () {
        new polsky.Parser('3 * x + ( 9 + y ) / 4').parse();
    }).

    add('Parser#parse - 13 tokens: ', function () {
        new polsky.Parser('3 + 4 * 2 / ( 1 - 5 ) ^ 2').parse();
    }).

    add('Parser#parse - 15 tokens: ', function () {
        new polsky.Parser('a * ( b / c ) * ( d / e ) * f').parse();
    }).

    add('Parser#parse - 17 tokens: ', function () {
        new polsky.Parser('6 * a * ( 7 * 7 / 9 ) * ( 2 / d )').parse();
    }).

    add('Parser#parse - 1 token reduced:   ', function () {
        new polsky.Parser('3').parse(true);
    }).

    add('Parser#parse - 3 tokens reduced:  ', function () {
        new polsky.Parser('4 * 2').parse(true);
    }).

    add('Parser#parse - 5 tokens reduced:  ', function () {
        new polsky.Parser('3 / 5 * 1').parse(true);
    }).
    add('Parser#parse - 7 tokens reduced:  ', function () {
        new polsky.Parser('2 * ( 5 / 1 )').parse(true);
    }).

    add('Parser#parse - 9 tokens reduced:  ', function () {
        new polsky.Parser('z + 3 * ( 8 - z )').parse(true);
    }).

    add('Parser#parse - 11 tokens reduced: ', function () {
        new polsky.Parser('3 * x + ( 9 + y ) / 4').parse(true);
    }).

    add('Parser#parse - 13 tokens reduced: ', function () {
        new polsky.Parser('3 + 4 * 2 / ( 1 - 5 ) ^ 2').parse(true);
    }).

    add('Parser#parse - 15 tokens reduced: ', function () {
        new polsky.Parser('a * ( b / c ) * ( d / e ) * f').parse(true);
    }).

    add('Parser#parse - 17 tokens reduced: ', function () {
        new polsky.Parser('6 * a * ( 7 * 7 / 9 ) * ( 2 / d )').parse(true);
    }).

    on('start', function () {
        process.stdout.write('Running Performance Tests');
    }).
 
    on('cycle', function () {
        process.stdout.write('.');
    }).

    on('complete', function () {
        process.stdout.write("\n" + this.join("\n"));
    }).

    run({async: true});
