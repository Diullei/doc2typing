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
    QUnit.equal('/**\n\r\
* My property description. Like other pieces of your comment blocks,\n\r\
* this can span multiple lines.\n\r\
*\n\r\
* @property propertyName\n\r\
* @type {Object}\n\r\
* @default "foo"\n\r\
*/', comments[2].block);
});

QUnit.test("extract comment text", function () {
    var comments: d2t.Comment[] = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.equal("My method description.  Like other pieces of your comment blocks, \nthis can span multiple lines.", comments[0].text);
});
