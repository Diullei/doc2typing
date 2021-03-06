module d2t {

    export class Tag {
        name: string;
        text: string;
    }

    export class CodeBlock {
        code: string;
        lang: string;

        constructor() {
            this.code = '';
            this.lang = 'n/d';
        }
    }

    export class DocComment {
        text: string;
        target: string;
        tags: Tag[] = [];
        codeBlock: CodeBlock;

        constructor(public block: string) {
            this.codeBlock = new CodeBlock();
            var unwrapBlock = this.unwrap(block);
            var inCodeBlock = false;
            var inTextBlock = true;
            this.text = '';

            var tagLines = '';
            var lines = unwrapBlock.match(/^.*((\r\n|\n|\r)|$)/gm);
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];

                // is block code start?
                if (line.match(/```\w+/gm)) {
                    inCodeBlock = true;
                    continue;
                }

                if (inCodeBlock) {
                    // is block code end?
                    if (line.trim() == '```') {
                        inCodeBlock = false;
                        this.codeBlock.code = this.codeBlock.code.trim();
                    } else
                        this.codeBlock.code += line;
                } else {
                    if (inTextBlock) {
                        if (this.isText(line)) {
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

        isText(value: string) {
            return !/^\s*@/.test(value);
        }

        unwrap(block: string) {
            if (!block) {
                return '';
            }

            return block.replace(/^\/\*\*+/, '') // remove opening slash+stars
                        .replace(/\**\*\/$/, "\\Z")       // replace closing star slash with end-marker
                        .replace(/^\s*(\* ?|\\Z)/gm, '')  // remove left margin like: spaces+star or spaces+end-marker
                        .replace(/\s*\\Z$/g, '');
        }

        splitTags(block: string): Tag[] {
            var tags: Tag[] = [];
            var tagText: string;
            var tagTitle: string;

            // split out the basic tags, keep surrounding whitespace
            // like: @tagTitle tagBody
            block
            .replace(/^(\s*)@(\S)/gm, '$1\\@$2') // replace splitter ats with an arbitrary sequence
            .split('\\@')                        // then split on that arbitrary sequence
            .forEach(function ($) {
                if ($) {
                    var parsedTag = $.match(/^(\S+)(:?\s+(\S[\s\S]*))?/);

                    if (parsedTag) {
                        // we don't need parsedTag[0]
                        tagTitle = (parsedTag[1] || '').trim();
                        tagText = (parsedTag[2] || '').trim();

                        if (tagTitle) {
                            tags.push(<Tag>{
                                name: tagTitle,
                                text: tagText
                            });
                        }
                    }
                }
            });

            return tags;
        }
    }

    export class Parser {

        constructor(public code: string) {
        }

        public exec(): any {
            var comments: DocComment[] = [];

            var reg = new RegExp('(/\\*([^*]|[\r\n]|(\\*+([^*/]|[\r\n])))*\\*+/)|(//.*)', 'gi');
            var result;

            var text = this.code;

            while ((result = reg.exec(text)) !== null) {
                var match = result[0];
                var comment = new DocComment(match);

                var lines = text.substr(match.length + result.index).match(/^.*((\r\n|\n|\r)|$)/gm);
                for (var i = 0; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        comment.target = this.extractJsInvokeName(lines[i]);
                        break;
                    }
                }
                comments.push(comment);
            }

            return comments;
        }

        private extractJsInvokeName(code: string) {
            var result = '';
            // function FUNCTION_NAME(...)
            if (code.match(/function\s+\w+\(/g)) {
                result = code.trim().split(' ')[1].split('(')[0];
            }
            return result;
        }
    }
}