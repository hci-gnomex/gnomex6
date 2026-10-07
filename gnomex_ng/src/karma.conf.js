// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const fs = require('fs');
const os = require('os');
const path = require('path');

// Newest Chromium downloaded by Playwright (`npx playwright install chromium` in ../e2e).
// Preferred because its version only changes when we ask: an auto-updated Edge (154, Oct 2026)
// started handing off to a child process on launch, which karma-chrome-launcher can't track.
function playwrightChromium() {
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'ms-playwright'),
    path.join(os.homedir(), '.cache', 'ms-playwright'),
    path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright'),
  ].filter(root => root && fs.existsSync(root));
  const executables = [
    'chrome-win64/chrome.exe',
    'chrome-win/chrome.exe',
    'chrome-linux64/chrome',
    'chrome-linux/chrome',
    'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  ];
  for (const root of roots) {
    const builds = fs.readdirSync(root)
      .filter(name => /^chromium-\d+$/.test(name))
      .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
    for (const build of builds) {
      const exe = executables.map(e => path.join(root, build, e)).find(p => fs.existsSync(p));
      if (exe) {
        return exe;
      }
    }
  }
  return null;
}

// karma-chrome-launcher needs a Chromium browser. Unless CHROME_BIN is set, use Playwright's
// Chromium, then an installed Chrome, then Microsoft Edge.
if (!process.env.CHROME_BIN) {
  const candidates = [
    playwrightChromium(),
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  const found = candidates.find(p => p && fs.existsSync(p));
  if (found) {
    process.env.CHROME_BIN = found;
  }
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../coverage/gnomex-ng'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    // Used by `npm run test:ci`. --no-sandbox is needed in containers and CI agents.
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
      }
    },
    browserNoActivityTimeout: 120000,
    singleRun: false,
    restartOnFileChange: true
  });
};
