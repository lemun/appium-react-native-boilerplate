import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

/**
 * Cross-platform selector and app-lifecycle helpers.
 *
 * Selector strategy cheat sheet for React Native:
 * - `testID` becomes the accessibility id on iOS and the `resource-id` on Android.
 * - `accessibilityLabel` becomes the accessibility id on both platforms (`content-desc` on Android).
 * Use `getByAccessibilityId` when the app sets an accessibility label on Android (the WebdriverIO demo
 * app does), and `getByTestId` for a plain React Native `testID`.
 */

/** Read a required environment variable or fail with a clear message. */
export function assertEnvironment(varName: string): string {
  const value = process.env[varName];

  if (!value) {
    throw new Error(`Environment variable ${varName} is required (see .env.example)`);
  }

  return value;
}

/** Read an optional environment variable, falling back to a default. */
export function envOr(varName: string, fallback: string): string {
  const value = process.env[varName];

  return value === undefined || value === '' ? fallback : value;
}

/** Escape a value for use inside a double-quoted iOS predicate or UiSelector string. */
function quote(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

/** Accessibility id: `testID` on iOS, `accessibilityLabel`/`content-desc` on Android. */
export function getByAccessibilityId(id: string): ChainablePromiseElement {
  return $(`~${id}`);
}

/** React Native `testID`: accessibility id on iOS, `resource-id` on Android. */
export function getByTestId(testId: string): ChainablePromiseElement {
  return driver.isIOS ? $(`~${testId}`) : $(`android=new UiSelector().resourceId("${quote(testId)}")`);
}

export function getAllByTestId(testId: string): ChainablePromiseArray {
  return driver.isIOS ? $$(`~${testId}`) : $$(`android=new UiSelector().resourceId("${quote(testId)}")`);
}

/** Exact visible text (iOS `label`, Android `text`). */
export function getByText(text: string): ChainablePromiseElement {
  return driver.isIOS
    ? $(`-ios predicate string:label == "${quote(text)}"`)
    : $(`android=new UiSelector().text("${quote(text)}")`);
}

export function getByTextContains(text: string): ChainablePromiseElement {
  return driver.isIOS
    ? $(`-ios predicate string:label CONTAINS "${quote(text)}"`)
    : $(`android=new UiSelector().textContains("${quote(text)}")`);
}

/**
 * Visible text matching a regular expression. Use `(?i)` for case-insensitive matching;
 * it works in both NSPredicate `MATCHES` (ICU) and UiSelector `textMatches` (Java regex).
 */
export function getByTextMatches(pattern: string): ChainablePromiseElement {
  return driver.isIOS
    ? $(`-ios predicate string:label MATCHES "${quote(pattern)}"`)
    : $(`android=new UiSelector().textMatches("${quote(pattern)}")`);
}

/**
 * Element by native class. iOS takes a class-chain query (for example
 * `**\/XCUIElementTypeButton[\`name == "OK"\`]`), Android a class name (for example `android.widget.Button`).
 */
export function getByClass(classQuery: string): ChainablePromiseElement {
  return driver.isIOS
    ? $(`-ios class chain:${classQuery}`)
    : $(`android=new UiSelector().className("${quote(classQuery)}")`);
}

/** XPath works on both platforms, but it is the slowest strategy: prefer ids. */
export function getByXpath(xpath: string): ChainablePromiseElement {
  return $(xpath);
}

/** The platform-specific app identifier for the current session (bundle id or package name). */
export function currentAppId(ids: { android: string; ios: string }): string {
  return driver.isIOS ? ids.ios : ids.android;
}

/** Terminate and relaunch the app without reinstalling it (app data survives, process memory does not). */
export async function relaunchApp(appId: string): Promise<void> {
  const args = driver.isAndroid ? { appId } : { bundleId: appId };

  await driver.execute('mobile: terminateApp', args);
  await driver.execute('mobile: activateApp', args);
}

type ActiveAppInfo = { bundleId: string };

/**
 * Run `action` against the iOS home screen (SpringBoard), for system dialogs that are not part of
 * the app's accessibility tree, such as the Face ID permission prompt. On Android the action runs as is.
 * See https://appium.github.io/appium-xcuitest-driver/latest/guides/troubleshooting/
 *
 * Errors thrown by the action are re-thrown after the active application has been restored.
 */
export async function executeInHomeScreenContext<T>(action: () => Promise<T>): Promise<T> {
  if (driver.isAndroid) {
    return action();
  }

  const { bundleId } = await driver.execute<ActiveAppInfo, []>('mobile: activeAppInfo');
  await driver.updateSettings({ defaultActiveApplication: 'com.apple.springboard' });

  try {
    return await action();
  } finally {
    await driver.updateSettings({ defaultActiveApplication: bundleId });
  }
}

/** Resolve to true if the element becomes displayed within `timeout`, false otherwise (never throws). */
export async function isShownWithin(element: ChainablePromiseElement, timeout: number): Promise<boolean> {
  try {
    await element.waitForDisplayed({ timeout });

    return true;
  } catch {
    return false;
  }
}
