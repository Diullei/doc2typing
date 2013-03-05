// typings
/// <reference path="../src/typings/DefinitelyTyped/node/node.d.ts" />
/// <reference path="../src/typings/DefinitelyTyped/qunit/qunit.d.ts" />

// dependencies
/// <reference path="../src/docEstract.ts" />

var fs = require("fs");

// ==================== EXTENDED - HELP METHOD ============================================

interface QUnitStatic {
    scapeEqual(actual: string, expected: string, message?: string);
}

QUnit.scapeEqual = function (actual: string, expected: string, message?: string) {
    function showScapes(text: string): string {
        if (!text)
            return '';
        
        text = text.replace(/\r/g, '¬');
        text = text.replace(/\n/g, '«');
        text = text.replace(/\s/g, '·');

        return text;
    }

    QUnit.equal(showScapes(actual), showScapes(expected), message);
}

// ========================================================================================

QUnit.module("Basic tests");

QUnit.test("get amount of comments", function () {
    var comments: d2t.Comment[] = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.ok(comments.length == 3);
});

QUnit.test("extract comment block", function () {
    var comments: d2t.Comment[] = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.scapeEqual(comments[2].block, '/**\r\n\
* My property description. Like other pieces of your comment blocks, \r\n\
* this can span multiple lines.\r\n* \r\n\
* @property propertyName\r\n\
* @type {Object}\r\n\
* @default "foo"\r\n\
*/');
});

QUnit.test("extract comment text", function () {
    var comments: d2t.Comment[] = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.scapeEqual(comments[1].text, 'My method description. Like other pieces of your comment blocks, \r\n\
this can span multiple lines.');
});

QUnit.test("extract tags", function () {
    var comments: d2t.Comment[] = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.equal(comments[1].tags[2].name, 'param');
    QUnit.equal(comments[1].tags[2].text, '{Object} config A config object');
});
