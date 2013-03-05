module d2t {

    export class Comment {
        text: string;
        constructor(public block: string) { }
    }

    export class Parser {

        constructor(public code: string) {
        }

        public exec(): any {
            var comments: Comment[] = [];

            var reg = new RegExp('(/\\*([^*]|[\r\n]|(\\*+([^*/]|[\r\n])))*\\*+/)|(//.*)', 'gi');
            var result;

            var c = 0;
            var text = this.code;

            while ((result = reg.exec(text)) !== null) {
                var match = result[0];

                comments.push(new Comment(match));

                text = text.substr(result[0].index);
                c += match.length;
            }

            return comments;
        }
    }
}