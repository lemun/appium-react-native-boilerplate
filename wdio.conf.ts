/**
 * Shared WebdriverIO configuration. Platform configs (`wdio.ios.conf.ts`, `wdio.android.conf.ts`) extend it
 * with capabilities. WebdriverIO loads `.env` automatically, so every variable in `.env.example` can be set there.
 * Option reference: https://webdriver.io/docs/configurationfile
 */
export const config: WebdriverIO.Config = {
  runner: 'local',
  // The capabilities are defined in the platform configs.
  capabilities: [],
  specs: ['./src/specs/**/*.spec.ts'],
  maxInstances: 1,

  logLevel: 'warn',
  outputDir: './logs',
  bail: 0,
  waitforTimeout: 20_000,
  connectionRetryTimeout: 180_000,
  connectionRetryCount: 1,

  // WebdriverIO starts and stops the project-local Appium 3 server (and its drivers from package.json).
  port: 4723,
  services: [
    [
      'appium',
      {
        logPath: './logs',
        appiumStartTimeout: 60_000,
        args: {
          // Lets the Android helpers run `adb shell` (screen lock + fingerprint enrollment).
          allowInsecure: ['uiautomator2:adb_shell'],
        },
      },
    ],
  ],

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    // Native interactions are slow; a single test may legitimately take a couple of minutes on CI emulators.
    timeout: 3 * 60 * 1000,
  },
  specFileRetries: Number(process.env['SPEC_FILE_RETRIES'] ?? 0),

  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'allure-results',
        disableWebdriverStepsReporting: true,
        reportedEnvironmentVars: { app: 'WebdriverIO native demo app' },
      },
    ],
  ],

  /** Save a screenshot of every failed test to ./logs (the Allure reporter attaches it to the report too). */
  afterTest: async (test, _context, { passed }) => {
    if (passed) {
      return;
    }

    const name = `${test.parent} ${test.title}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    await driver.saveScreenshot(`./logs/${name}.png`);
  },
};
