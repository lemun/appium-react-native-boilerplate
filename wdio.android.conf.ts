import { config as baseConfig } from './wdio.conf.js';
import { assertEnvironment } from './src/helpers/Utils.js';
import { execSync } from 'child_process';

const findApkPath = (): string => {
  const path = execSync(
    `powershell "Get-ChildItem -Path '${assertEnvironment('REACT_NATIVE_PATH')}' -Recurse -Filter 'app-debug.apk' | Where-Object { $_.FullName -like '*\\android\\app\\build\\outputs\\apk\\debug\\*' } | Select-Object -First 1 -ExpandProperty FullName"`,
    { encoding: 'utf8' }
  ).trim();

  if (!path) {
    throw new Error(`Android APK not found in path.`);
  }

  return path;
};

export const config: WebdriverIO.Config = {
  ...baseConfig,

  capabilities: [
    {
      ...baseConfig.capabilities![0],
      platformName: 'Android',
      'appium:deviceName': assertEnvironment('ANDROID_DEVICE_NAME'),
      'appium:platformVersion': assertEnvironment('ANDROID_PLATFORM_VERSION'),
      'appium:automationName': 'UiAutomator2',
      'appium:app': findApkPath(),
      'appium:appWaitActivity': `${assertEnvironment('BUNDLE_ID')}.MainActivity`,
      'appium:autoGrantPermissions': assertEnvironment('AUTO_GRANT_PERMISSIONS') === 'true',
    },
  ],
};
