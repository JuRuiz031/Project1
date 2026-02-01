// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

// Use Puppeteer's bundled Chrome for headless testing
process.env.CHROME_BIN = require('puppeteer').executablePath();

/**
 * IMPORTANT:
 * This project is currently configured to run tests using Firefox:
 *
 *     browsers: ['Firefox']
 *
 * In order for `ng test` to work:
 *   - Firefox MUST be installed on your machine, and
 *   - the `karma-firefox-launcher` plugin must be installed.
 *
 * ---------------------------------------------------------
 * To use Chrome instead:
 * ---------------------------------------------------------
 * 1) Install Chrome on your system.
 * 2) Install the Chrome launcher:
 *      npm install --save-dev karma-chrome-launcher
 * 3) In this file:
 *      - replace 'Firefox' with 'Chrome' in the `browsers` array
 *      - replace `karma-firefox-launcher` with `karma-chrome-launcher`
 *
 * ---------------------------------------------------------
 * To use Safari (macOS only):
 * ---------------------------------------------------------
 * Safari is only supported on macOS.
 *
 * 1) Install the Safari launcher:
 *      npm install --save-dev karma-safari-launcher
 * 2) In this file:
 *      - add `require('karma-safari-launcher')` to the plugins array
 *      - change the `browsers` array to: ['Safari']
 *
 * Note:
 * Karma will try to launch EVERY browser listed in `browsers`.
 * If any listed browser is not installed or its launcher is missing,
 * the test run will fail.
 */


module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'), // Plugin that allows Karma to start Firefox
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    // Custom launcher for WSL/Linux environments
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-software-rasterizer',
        ],
      },
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/front-end'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['Chrome'], // Browser Karma will try to launch to run the tests
    singleRun: false,
    restartOnFileChange: true,
    browserNoActivityTimeout: 60000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
  });
};
