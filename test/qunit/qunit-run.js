//based on: https://github.com/ElemarJR/QUnit-run

var QUnit = require("./qunit").QUnit,
	fs = require("fs"),
	exitcode = 0;

var print = console.log;

var	print_fail = function (msg) {
	print("\33[31m\33[1m" + msg + "\33[0m");
};

var	print_sucess = function (msg) {
	print("\33[32m\33[1m" + msg + "\33[0m");
};

var print_highlight = function (msg) {
	print("\n\33[1m" + msg + "\33[0m");
};

var stopWatch = {
	startTime: null, 
	stopTime: null,
	start: function () {
		this.startTime = new Date();
	},
	stop: function () {
		this.stopTime = new Date();
	},
	elapsedSeconds: function () {
		return (this.stopTime.getMilliseconds() - this.startTime.getMilliseconds()) / 1000;
	}
};

(function () {
    QUnit.init();

    QUnit.moduleStart = function (data) {
		print_highlight("module: " + data.name);
	};

    QUnit.moduleDone = function (data) {
		print("\n" +
			"\33[31m\33[1m" + data.failed + "\33[0m failed. " + 
			"\33[32m\33[1m" + data.passed +"\33[0m passed. " + 
			"\33[1m" + data.total + "\33[0m total."
			);
	};

    QUnit.testStart = function (data) {
		print_highlight("\n  test: " +  data.name);
	};

    QUnit.testDone = function (data) {
		print("\n  " + 
			"\33[31m\33[1m" + data.failed + "\33[0m failed. " + 
			"\33[32m\33[1m" + data.passed +"\33[0m passed. " + 
			"\33[1m" + data.total + "\33[0m total."
			);
	};

    QUnit.done = function (data) {
		stopWatch.stop();
		print("\nFinished in " + stopWatch.elapsedSeconds() + " seconds.");
		if (data.failed > 0) {
			exitcode = 1;
		}
	};

    QUnit.begin = function () {
		stopWatch.start();
	};

    QUnit.log = function (data) {
		var p = data.result ? print_sucess : print_fail,
			t = "    " ;

		p("\n██" + t + (data.message || '') );
		if (data.actual !== data.expected)
		{
		    p("██" + t + " ======================== Actual ===========\n" + data.actual);
		    p("██" + t + " ======================== Expected: ========\n" + data.expected);
		}
	};
} ());

if (process.argv.length < 3) {
	print_fail("Use: node qunit-run <test-script>");
	exitcode = 2;
} else  {
    eval("with (QUnit) {" + fs.readFileSync(process.argv[2], "utf-8") + "}");
    QUnit.begin();
    QUnit.start();
}

process.exit(exitcode);
