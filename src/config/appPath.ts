import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { APPS_DIR, DEMO_APP, type Platform } from './demoApp.ts';

/**
 * Resolve the binary under test: `APP_PATH` when set (your own app), otherwise the pinned demo app in ./apps.
 * Fails fast with an actionable message instead of letting Appium report a vague install error.
 */
export function resolveAppPath(platform: Platform): string {
  const fromEnv = process.env['APP_PATH'];
  const appPath = fromEnv ? resolve(fromEnv) : resolve(APPS_DIR, DEMO_APP[platform].asset);

  if (!existsSync(appPath)) {
    throw new Error(
      fromEnv
        ? `APP_PATH points to a missing file: ${appPath}`
        : `Demo app not found at ${appPath}. Run "npm run app:download -- ${platform}" first.`,
    );
  }

  return appPath;
}

/** Bundle id / package name of the app under test (`APP_ID` overrides the demo app id). */
export function appId(platform: Platform): string {
  return process.env['APP_ID'] || DEMO_APP[platform].appId;
}

/** The platform of the running session. */
export function sessionPlatform(): Platform {
  return driver.isIOS ? 'ios' : 'android';
}
