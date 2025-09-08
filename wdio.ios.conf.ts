import { execSync } from 'child_process';
import { config as baseConfig } from './wdio.conf.js';
import { assertEnvironment } from './src/helpers/Utils.js';

const findIOSAppPath = (): string => {
  const path = execSync(
    `find ~/Library/Developer/Xcode/DerivedData -name "${assertEnvironment('BUNDLE_ID')}.app" -type d -print0 | xargs -0 ls -td | head -n 1`,
    { encoding: 'utf8' },
  ).trim();

  if (!path) {
    throw new Error('App not found in DerivedData. Please build the iOS app first.');
  }

  return path;
};

export const config: WebdriverIO.Config = {
  ...baseConfig,

  capabilities: [
    {
      ...baseConfig.capabilities![0],
      platformName: 'iOS',
      'appium:deviceName': assertEnvironment('IOS_DEVICE_NAME'),
      'appium:platformVersion': assertEnvironment('IOS_PLATFORM_VERSION'),
      'appium:automationName': 'XCUITest',
      'appium:app': findIOSAppPath(),
      'appium:webviewConnectTimeout': 5000,
      'appium:autoAcceptAlerts': assertEnvironment('AUTO_ACCEPT_ALERTS') === 'true',
    },
  ],
};
