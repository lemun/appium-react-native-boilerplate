import { config as baseConfig } from './wdio.conf.ts';
import { resolveAppPath } from './src/config/appPath.ts';

const env = process.env;

export const config: WebdriverIO.Config = {
  ...baseConfig,
  capabilities: [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      // Any simulator from `xcrun simctl list devices available`; set IOS_UDID to pin an exact device.
      'appium:deviceName': env['IOS_DEVICE_NAME'] || 'iPhone 17 Pro',
      ...(env['IOS_PLATFORM_VERSION'] ? { 'appium:platformVersion': env['IOS_PLATFORM_VERSION'] } : {}),
      ...(env['IOS_UDID'] ? { 'appium:udid': env['IOS_UDID'] } : {}),
      'appium:app': resolveAppPath('ios'),
      'appium:newCommandTimeout': 240,
      // Expo apps host their WebView in a separate process; match any bundle id when listing WebViews.
      'appium:additionalWebviewBundleIds': ['*'],
      'appium:webviewConnectTimeout': 20_000,
      // Typing too fast into React Native inputs on the simulator can drop characters.
      'appium:maxTypingFrequency': 30,
      'appium:wdaLaunchTimeout': 240_000,
    },
  ],
};
