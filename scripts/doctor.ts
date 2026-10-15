/**
 * Check that this machine can run the suite, and say exactly what to fix.
 *
 *   npm run doctor             # checks both platforms, exits 1 if neither platform is ready
 *   npm run doctor -- ios      # only the iOS toolchain
 *   npm run doctor -- android  # only the Android toolchain
 *
 * Read-only: it never installs, boots or downloads anything.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { APPS_DIR, DEMO_APP, type Platform } from '../src/config/demoApp.ts';

type Check = { ok: boolean; label: string; fix?: string };

function run(command: string, args: string[]): string | undefined {
  try {
    return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return undefined;
  }
}

function check(ok: boolean, label: string, fix: string): Check {
  return ok ? { ok, label } : { ok, label, fix };
}

function commonChecks(): Check[] {
  const [major = 0, minor = 0] = process.versions.node.split('.').map(Number);
  const nodeOk = major > 22 || (major === 22 && minor >= 19);
  const drivers = run('npx', ['--no-install', 'appium', 'driver', 'list', '--installed', '--json']) ?? '';

  return [
    check(
      nodeOk,
      `Node.js ${process.versions.node} (needs >= 22.19)`,
      'Install Node 24 LTS: `nvm install` (reads .nvmrc)',
    ),
    check(existsSync('node_modules/appium'), 'Project-local Appium 3 installed', 'Run `npm ci`'),
    check(
      drivers.includes('xcuitest') && drivers.includes('uiautomator2'),
      'Appium drivers xcuitest + uiautomator2',
      'Run `npm ci` (drivers are devDependencies)',
    ),
  ];
}

function iosChecks(): Check[] {
  if (process.platform !== 'darwin') {
    return [{ ok: false, label: 'iOS needs macOS with Xcode', fix: 'Run the Android suite instead' }];
  }

  const xcode = run('xcodebuild', ['-version'])?.split('\n')[0];
  const devices = run('xcrun', ['simctl', 'list', 'devices', 'available']) ?? '';
  const wanted = process.env['IOS_DEVICE_NAME'] || 'iPhone 17 Pro';
  const app = join(APPS_DIR, DEMO_APP.ios.asset);

  return [
    check(
      xcode !== undefined,
      `Xcode: ${xcode ?? 'not found'}`,
      'Install Xcode and run `sudo xcode-select -s /Applications/Xcode.app`',
    ),
    check(
      devices.includes(`${wanted} (`),
      `Simulator "${wanted}" exists`,
      `Create it: \`xcrun simctl create "${wanted}" "${wanted}"\` or set IOS_DEVICE_NAME to one from \`xcrun simctl list devices available\``,
    ),
    check(
      Boolean(process.env['APP_PATH']) || existsSync(app),
      `App binary: ${process.env['APP_PATH'] ?? app}`,
      'Run `npm run app:download -- ios`',
    ),
  ];
}

function androidChecks(): Check[] {
  const sdk = process.env['ANDROID_HOME'] ?? process.env['ANDROID_SDK_ROOT'];
  const adbDevices = run('adb', ['devices']) ?? '';
  const online = adbDevices
    .split('\n')
    .slice(1)
    .filter((line) => line.trim().endsWith('device'));
  const avds = run(sdk ? join(sdk, 'emulator', 'emulator') : 'emulator', ['-list-avds']) ?? '';
  const java = run('java', ['-version']) !== undefined || Boolean(process.env['JAVA_HOME']);
  const app = join(APPS_DIR, DEMO_APP.android.asset);
  const avd = process.env['ANDROID_AVD'];

  return [
    check(
      Boolean(sdk && existsSync(sdk)),
      `ANDROID_HOME: ${sdk ?? 'not set'}`,
      'Install the Android SDK and export ANDROID_HOME',
    ),
    check(java, 'Java (JDK 17+) available', 'Install a JDK and export JAVA_HOME'),
    check(
      online.length > 0 || (avd !== undefined && avds.split('\n').includes(avd)),
      online.length > 0 ? `Device online: ${online.join(', ')}` : `Emulator: ANDROID_AVD=${avd ?? 'not set'}`,
      `Start an emulator, or set ANDROID_AVD to one of: ${avds.split('\n').filter(Boolean).join(', ') || 'none (create one in Android Studio)'}`,
    ),
    check(
      Boolean(process.env['APP_PATH']) || existsSync(app),
      `App binary: ${process.env['APP_PATH'] ?? app}`,
      'Run `npm run app:download -- android`',
    ),
  ];
}

function report(title: string, checks: Check[]): boolean {
  console.log(`\n${title}`);

  for (const { ok, label, fix } of checks) {
    console.log(`  ${ok ? '✔' : '✖'} ${label}${fix ? `\n      → ${fix}` : ''}`);
  }

  return checks.every((item) => item.ok);
}

const requested = process.argv.slice(2) as Platform[];
const platforms: Platform[] = requested.length > 0 ? requested : ['ios', 'android'];

const commonOk = report('Common', commonChecks());
const ready = platforms.filter((platform) =>
  report(
    platform === 'ios' ? 'iOS (XCUITest)' : 'Android (UiAutomator2)',
    platform === 'ios' ? iosChecks() : androidChecks(),
  ),
);

console.log(
  `\nReady: ${ready.length > 0 && commonOk ? ready.map((p) => `npm run ${p}`).join(', ') : 'nothing yet, fix the ✖ items above'}`,
);
process.exit(commonOk && ready.length > 0 ? 0 : 1);
