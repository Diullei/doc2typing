tsc ./test/docEstract-test.ts --out ./test/tests.js
node ./test/qunit/qunit-run ./test/tests.js