module d2t {

    export class Tag {
        name: string;
        text: string;
    }

    export class DocComment {
        text: string;
        tags: Tag[] = [];

        constructor(public block: string) {
            this.text = '';
            var unwrapBlock = this.unwrap(block);

            var tagLines = '';
            var lines = unwrapBlock.match(/^.*((\r\n|\n|\r)|$)/gm);
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (this.isText(line)) {
                    this.text += line + '\n';
                } else {
                    tagLines += line + '\n';
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

            var c = 0;
            var text = this.code;

            while ((result = reg.exec(text)) !== null) {
                var match = result[0];
                comments.push(new DocComment(match));
                text = text.substr(result[0].index);
                c += match.length;
            }

            return comments;
        }
    }
}