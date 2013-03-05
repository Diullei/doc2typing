// typings
/// <reference path="../src/typings/DefinitelyTyped/node/node.d.ts" />
/// <reference path="../src/typings/DefinitelyTyped/qunit/qunit.d.ts" />

// dependencies
/// <reference path="../src/docEstract.ts" />

var fs = require("fs");

QUnit.test("get amount of comments", function () {
    var comments: d2t.Comment[] = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.ok(comments.length == 3);
});

QUnit.test("extract comment block", function () {
    var comments: d2t.Comment[] = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.equal('/**\r\n\
* My property description. Like other pieces of your comment blocks, \r\n\
* this can span multiple lines.\r\n* \r\n\
* @property propertyName\r\n\
* @type {Object}\r\n\
* @default "foo"\r\n\
*/', comments[2].block);
});

QUnit.test("extract comment text", function () {
    var comments: d2t.Comment[] = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.equal('My method description. Like other pieces of your comment blocks, \n\
this can span multiple lines.', comments[1].text);
});

QUnit.test("extract tags", function () {
    var comments: d2t.Comment[] = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.equal('param', comments[1].tags[2].name);
    QUnit.equal('{Object} config A config object', comments[1].tags[2].text);
});
