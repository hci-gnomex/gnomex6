/**
 * Based on https://github.com/AngularClass/angular-starter/blob/master
 */
require("core-js/es6");
require("core-js/es7/reflect");
require("rxjs/Rx");

require("zone.js/dist/zone");
require("zone.js/dist/long-stack-trace-zone");
require("zone.js/dist/proxy");
require("zone.js/dist/sync-test");
require("zone.js/dist/jasmine-patch");
require("zone.js/dist/async-test");
require("zone.js/dist/fake-async-test");

Error.stackTraceLimit = Infinity;

var testing = require("@angular/core/testing");
var browser = require("@angular/platform-browser-dynamic/testing");

testing.TestBed.initTestEnvironment(browser.BrowserDynamicTestingModule, browser.platformBrowserDynamicTesting());

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

var modules = requireAll(require.context("../src", true, /\.spec\.ts/));
