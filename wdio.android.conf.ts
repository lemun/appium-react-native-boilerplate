import { config as baseConfig } from './wdio.conf.js';
import { assertEnvironment } from './src/helpers/Utils.js';
import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync, readdirSync, statSync } from 'fs';

const findApkPath = (): string => {
  const reactNativePath = assertEnvironment('REACT_NATIVE_PATH');
  const apkSearchPaths = [
    join(reactNativePath, 'android', 'app', 'build', 'outputs', 'apk', 'debug'),
    join(reactNativePath, 'android', 'app', 'build', 'outputs', 'apk', 'release'),
  ];

  // First try the standard paths
  for (const searchPath of apkSearchPaths) {
    if (existsSync(searchPath)) {
      const files = readdirSync(searchPath);
      const apkFile = files.find(file => file.endsWith('.apk'));
      if (apkFile) {
        return join(searchPath, apkFile);
      }
    }
  }

  // If not found in standard paths, search recursively
  const findApkRecursive = (dir: string): string | null => {
    if (!existsSync(dir)) return null;
    
    try {
      const items = readdirSync(dir);
      
      // Look for APK files in current directory
      for (const item of items) {
        if (item.endsWith('.apk')) {
          const fullPath = join(dir, item);
          // Prefer debug APKs, but accept any APK
          if (item.includes('debug') || item.includes('app-')) {
            return fullPath;
          }
        }
      }
      
      // Recursively search subdirectories
      for (const item of items) {
        const fullPath = join(dir, item);
        if (statSync(fullPath).isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          const result = findApkRecursive(fullPath);
          if (result) return result;
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return null;
  };

  const apkPath = findApkRecursive(join(reactNativePath, 'android'));
  
  if (!apkPath) {
    throw new Error(`Android APK not found in path: ${reactNativePath}. Please ensure the app is built first.`);
  }

  return apkPath;
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
