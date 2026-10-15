import { config as baseConfig } from './wdio.conf.ts';
import { resolveAppPath } from './src/config/appPath.ts';
import { DEMO_APP } from './src/config/demoApp.ts';

const env = process.env;

export const config: WebdriverIO.Config = {
  ...baseConfig,
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': env['ANDROID_DEVICE_NAME'] || 'Android Emulator',
      // With ANDROID_AVD set, Appium boots that emulator itself (`emulator -list-avds`).
      ...(env['ANDROID_AVD'] ? { 'appium:avd': env['ANDROID_AVD'], 'appium:avdLaunchTimeout': 300_000 } : {}),
      ...(env['ANDROID_PLATFORM_VERSION'] ? { 'appium:platformVersion': env['ANDROID_PLATFORM_VERSION'] } : {}),
      ...(env['ANDROID_UDID'] ? { 'appium:udid': env['ANDROID_UDID'] } : {}),
      'appium:app': resolveAppPath('android'),
      ...(env['APP_PATH'] ? {} : { 'appium:appWaitActivity': DEMO_APP.android.activity }),
      'appium:autoGrantPermissions': true,
      'appium:newCommandTimeout': 240,
      'appium:uiautomator2ServerInstallTimeout': 120_000,
      'appium:adbExecTimeout': 60_000,
    },
  ],
  before: async () => {
    // UiSelector lookups wait 10s by default before failing; 3s keeps negative checks fast.
    await driver.updateSettings({ waitForSelectorTimeout: 3_000 });
  },
};
