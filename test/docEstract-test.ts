﻿// typings
/// <reference path="../src/typings/DefinitelyTyped/node/node.d.ts" />
/// <reference path="../src/typings/DefinitelyTyped/qunit/qunit.d.ts" />

// dependencies
/// <reference path="qunit-extended.ts" />
/// <reference path="../src/docEstract.ts" />

var fs = require("fs");

QUnit.module("Basic tests");

QUnit.test("get amount of comments", function () {
    var comments: d2t.DocComment[] = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.ok(comments.length == 3);
});

QUnit.test("extract comment block", function () {
    var comments: d2t.DocComment[] = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.scapeEqual(comments[2].block, '/**\r\n\
* My property description. Like other pieces of your comment blocks, \r\n\
* this can span multiple lines.\r\n* \r\n\
* @property propertyName\r\n\
* @type {Object}\r\n\
* @default "foo"\r\n\
*/');
});

QUnit.test("extract comment text", function () {
    var comments: d2t.DocComment[] = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.scapeEqual(comments[1].text, 'My method description. Like other pieces of your comment blocks, \r\n\
this can span multiple lines.');
});

QUnit.test("extract tags", function () {
    var comments: d2t.DocComment[] = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();

    QUnit.equal(comments[1].tags[0].name, 'method');
    QUnit.equal(comments[1].tags[0].text, 'methodName');

    QUnit.equal(comments[1].tags[1].name, 'param');
    QUnit.equal(comments[1].tags[1].text, '{String} foo Argument 1');

    QUnit.equal(comments[1].tags[2].name, 'param');
    QUnit.equal(comments[1].tags[2].text, '{Object} config A config object');

    QUnit.equal(comments[1].tags[3].name, 'param');
    QUnit.equal(comments[1].tags[3].text, '{String} config.name The name on the config object');

    QUnit.equal(comments[1].tags[4].name, 'param');
    QUnit.equal(comments[1].tags[4].text, '{Function} config.callback A callback function on the config object');

    QUnit.equal(comments[1].tags[5].name, 'param');
    QUnit.equal(comments[1].tags[5].text, '{Boolean} [extra=false] Do extra, optional work');

    QUnit.equal(comments[1].tags[6].name, 'return');
    QUnit.equal(comments[1].tags[6].text, '{Boolean} Returns true on success');
});
