// typings
/// <reference path="../src/typings/DefinitelyTyped/qunit/qunit.d.ts" />

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
