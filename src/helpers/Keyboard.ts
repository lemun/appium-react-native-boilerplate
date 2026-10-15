import type { ChainablePromiseElement } from 'webdriverio';

/**
 * Hide the on-screen keyboard in a way that works on both platforms.
 *
 * `driver.hideKeyboard()` is reliable on Android, but on iPhone XCTest often cannot dismiss the keyboard
 * ("The keyboard on iPhone cannot be dismissed because of a known XCTest issue"), so on iOS we tap a
 * neutral element of the screen instead, which is what a user would do.
 */
export async function hideKeyboard(neutralElement: ChainablePromiseElement): Promise<void> {
  if (!(await driver.isKeyboardShown())) {
    return;
  }

  if (driver.isAndroid) {
    await driver.hideKeyboard();

    return;
  }

  await neutralElement.click();
}
