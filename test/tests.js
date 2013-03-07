QUnit.scapeEqual = function (actual, expected, message) {
    function showScapes(text) {
        if(!text) {
            return '';
        }
        text = text.replace(/\r/g, '¬');
        text = text.replace(/\n/g, '«');
        text = text.replace(/\s/g, '·');
        text = text.replace(/«/g, '«\n');
        return text;
    }
    QUnit.equal(showScapes(actual), showScapes(expected), message);
};
var d2t;
(function (d2t) {
    var Tag = (function () {
        function Tag() { }
        return Tag;
    })();
    d2t.Tag = Tag;    
    var CodeBlock = (function () {
        function CodeBlock() {
            this.code = '';
            this.lang = 'n/d';
        }
        return CodeBlock;
    })();
    d2t.CodeBlock = CodeBlock;    
    var DocComment = (function () {
        function DocComment(block) {
            this.block = block;
            this.tags = [];
            this.codeBlock = new CodeBlock();
            this.text = '';
            var unwrapBlock = this.unwrap(block);
            var inCodeBlock = false;
            var inTextBlock = true;
            var tagLines = '';
            var lines = unwrapBlock.match(/^.*((\r\n|\n|\r)|$)/gm);
            for(var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if(line.match(/```\w+/gm)) {
                    inCodeBlock = true;
                    continue;
                }
                if(inCodeBlock) {
                    if(line.trim() == '```') {
                        inCodeBlock = false;
                        this.codeBlock.code = this.codeBlock.code.trim();
                    } else {
                        this.codeBlock.code += line;
                    }
                } else {
                    if(inTextBlock) {
                        if(this.isText(line)) {
                            this.text += line;
                        } else {
                            inTextBlock = false;
                            tagLines += line;
                        }
                    } else {
                        tagLines += line;
                    }
                }
            }
            this.tags = this.splitTags(tagLines);
            this.text = this.text.trim();
        }
        DocComment.prototype.isText = function (value) {
            return !/^\s*@/.test(value);
        };
        DocComment.prototype.unwrap = function (block) {
            if(!block) {
                return '';
            }
            return block.replace(/^\/\*\*+/, '').replace(/\**\*\/$/, "\\Z").replace(/^\s*(\* ?|\\Z)/gm, '').replace(/\s*\\Z$/g, '');
        };
        DocComment.prototype.splitTags = function (block) {
            var tags = [];
            var tagText;
            var tagTitle;
            block.replace(/^(\s*)@(\S)/gm, '$1\\@$2').split('\\@').forEach(function ($) {
                if($) {
                    var parsedTag = $.match(/^(\S+)(:?\s+(\S[\s\S]*))?/);
                    if(parsedTag) {
                        tagTitle = (parsedTag[1] || '').trim();
                        tagText = (parsedTag[2] || '').trim();
                        if(tagTitle) {
                            tags.push({
                                name: tagTitle,
                                text: tagText
                            });
                        }
                    }
                }
            });
            return tags;
        };
        return DocComment;
    })();
    d2t.DocComment = DocComment;    
    var Parser = (function () {
        function Parser(code) {
            this.code = code;
        }
        Parser.prototype.exec = function () {
            var comments = [];
            var reg = new RegExp('(/\\*([^*]|[\r\n]|(\\*+([^*/]|[\r\n])))*\\*+/)|(//.*)', 'gi');
            var result;
            var c = 0;
            var text = this.code;
            while((result = reg.exec(text)) !== null) {
                var match = result[0];
                comments.push(new DocComment(match));
                text = text.substr(result[0].index);
                c += match.length;
            }
            return comments;
        };
        return Parser;
    })();
    d2t.Parser = Parser;    
})(d2t || (d2t = {}));
var fs = require("fs");
QUnit.module("Basic tests");
QUnit.test("get amount of comments", function () {
    var comments = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.ok(comments.length == 3);
});
QUnit.test("extract comment block", function () {
    var comments = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.scapeEqual(comments[2].block, '/**\r\n\
* My property description. Like other pieces of your comment blocks, \r\n\
* this can span multiple lines.\r\n* \r\n\
* @property propertyName\r\n\
* @type {Object}\r\n\
* @default "foo"\r\n\
*/');
});
QUnit.test("extract comment text", function () {
    var comments = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
    QUnit.scapeEqual(comments[1].text, 'My method description. Like other pieces of your comment blocks, \r\
this can span multiple lines.');
});
QUnit.test("extract tags", function () {
    var comments = new d2t.Parser(fs.readFileSync("test/fixtures/comment.js", 'utf8')).exec();
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
QUnit.test("extract comment text 2", function () {
    var comments = new d2t.Parser(fs.readFileSync("test/fixtures/comment2.js", 'utf8')).exec();
    QUnit.scapeEqual(comments[0].text, 'Define an assertion that will throw an exception if the condition is not\r\n\
  met. Ember build tools will remove any calls to `Ember.assert()` when\r\n\
  doing a production build. Example:');
});
QUnit.test("extract code block", function () {
    var comments = new d2t.Parser(fs.readFileSync("test/fixtures/comment2.js", 'utf8')).exec();
    QUnit.scapeEqual(comments[0].codeBlock.code, '// Test for truthiness\r\n\
  Ember.assert(\'Must pass a valid object\', obj);\r\n\
  // Fail unconditionally\r\n\
  Ember.assert(\'This code path should never be run\')');
});
QUnit.test("extract multline tag text", function () {
    var comments = new d2t.Parser(fs.readFileSync("test/fixtures/comment2.js", 'utf8')).exec();
    QUnit.scapeEqual(comments[0].tags[1].text, '{String} desc A description of the assertion. This will become\r\n\
    the text of the Error thrown if the assertion fails.');
});
