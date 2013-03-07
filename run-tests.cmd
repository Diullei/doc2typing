tsc ./test/docExtract-test.ts --out ./test/tests.js
node ./test/qunit/qunit-run ./test/tests.js