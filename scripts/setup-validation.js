#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`),
};

function checkCommand(command, name, required = true) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    log.success(`${name} is installed`);
    return true;
  } catch (error) {
    if (required) {
      log.error(`${name} is not installed or not in PATH`);
    } else {
      log.warning(`${name} is not installed (optional)`);
    }
    return false;
  }
}

function checkEnvironmentFile() {
  const envPath = join(process.cwd(), '.env');
  const envExamplePath = join(process.cwd(), '.env.example');
  
  if (!existsSync(envExamplePath)) {
    log.error('.env.example file not found');
    return false;
  }
  
  if (!existsSync(envPath)) {
    log.warning('.env file not found. Copy .env.example to .env and fill in your values');
    return false;
  }
  
  log.success('Environment files are present');
  return true;
}

function checkAndroidSetup() {
  log.header('Android Setup Validation');
  
  let allGood = true;
  
  // Check Android SDK
  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!androidHome) {
    log.error('ANDROID_HOME or ANDROID_SDK_ROOT environment variable not set');
    allGood = false;
  } else if (!existsSync(androidHome)) {
    log.error(`Android SDK path does not exist: ${androidHome}`);
    allGood = false;
  } else {
    log.success('Android SDK path is valid');
  }
  
  // Check ADB
  if (!checkCommand('adb', 'Android Debug Bridge (adb)')) {
    allGood = false;
  }
  
  // Check emulator command
  checkCommand('emulator', 'Android Emulator', false);
  
  return allGood;
}

function checkiOSSetup() {
  log.header('iOS Setup Validation');
  
  if (process.platform !== 'darwin') {
    log.warning('iOS testing is only available on macOS');
    return false;
  }
  
  let allGood = true;
  
  // Check Xcode
  if (!checkCommand('xcodebuild', 'Xcode')) {
    allGood = false;
  }
  
  // Check iOS Simulator
  if (!checkCommand('xcrun simctl list', 'iOS Simulator', false)) {
    log.warning('iOS Simulator might not be available');
  }
  
  return allGood;
}

function main() {
  log.header('🔍 Appium React Native Boilerplate Setup Validation');
  
  let overallStatus = true;
  
  // Check Node.js and npm
  log.header('Node.js Environment');
  if (!checkCommand('node', 'Node.js')) overallStatus = false;
  if (!checkCommand('npm', 'npm')) overallStatus = false;
  
  // Check Appium
  log.header('Appium Setup');
  if (!checkCommand('appium', 'Appium')) {
    log.info('Install Appium globally: npm install -g appium');
    overallStatus = false;
  }
  
  // Check environment files
  log.header('Environment Configuration');
  if (!checkEnvironmentFile()) overallStatus = false;
  
  // Platform-specific checks
  const androidOk = checkAndroidSetup();
  const iosOk = checkiOSSetup();
  
  if (!androidOk && !iosOk) {
    log.error('Neither Android nor iOS setup is complete');
    overallStatus = false;
  }
  
  // Summary
  log.header('Summary');
  if (overallStatus) {
    log.success('Setup validation completed successfully! 🎉');
    log.info('You can now run tests with: npm run android or npm run ios');
  } else {
    log.error('Setup validation failed. Please fix the issues above.');
    process.exit(1);
  }
}

main();