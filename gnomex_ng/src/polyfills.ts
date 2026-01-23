/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 */

// Zone JS is required by default for Angular itself.
import "zone.js/dist/zone";

// Polyfills for older browsers (if needed based on browserslist)
// With core-js@3, only include specific features you need:
// import 'core-js/features/array';
// import 'core-js/features/promise';
// import 'core-js/features/object';

// Note: core-js@3 uses a different import structure than core-js@2
// The old "core-js/es6" and "core-js/es7/reflect" are no longer needed
// as Angular 8 with TypeScript 3.5 targets ES2015+ which includes these features
import "hammerjs/hammer";

if (process.env.ENV === "production") {
    // Production
} else {
    Error["stackTraceLimit"] = Infinity;
    require("zone.js/dist/long-stack-trace-zone");
}
