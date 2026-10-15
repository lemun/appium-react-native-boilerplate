const IOS_ALERT = "-ios predicate string:type == 'XCUIElementTypeAlert'";
const IOS_ALERT_TEXTS = '-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeStaticText';
const ANDROID_TITLE = 'android=new UiSelector().resourceIdMatches(".*:id/(alertTitle|alert_title)")';
const ANDROID_MESSAGE = 'android=new UiSelector().resourceId("android:id/message")';

/**
 * A native OS alert (React Native `Alert.alert`) on either platform.
 * On iOS this is an `XCUIElementTypeAlert`; on Android an AlertDialog with title, message and buttons.
 */
class NativeAlert {
  private get anchor() {
    return $(driver.isIOS ? IOS_ALERT : ANDROID_TITLE);
  }

  async waitForIsShown(isShown = true, timeout = 15_000): Promise<void> {
    await this.anchor.waitForExist({ timeout, reverse: !isShown });
  }

  /** Title and message joined by a newline, identical on both platforms. */
  async text(): Promise<string> {
    if (driver.isIOS) {
      const labels = await $$(IOS_ALERT_TEXTS).map((element) => element.getText());

      return labels.join('\n');
    }

    const title = await $(ANDROID_TITLE).getText();
    const message = (await $(ANDROID_MESSAGE).isExisting()) ? await $(ANDROID_MESSAGE).getText() : '';

    return message ? `${title}\n${message}` : title;
  }

  /** Tap a button by its visible label, for example `OK` or `Cancel` (Android renders labels in upper case). */
  async tapButton(label: string): Promise<void> {
    const button = driver.isIOS
      ? $(`-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeButton[\`label == "${label}"\`]`)
      : $(`android=new UiSelector().className("android.widget.Button").textMatches("(?i)${label}")`);

    await button.click();
  }

  /** Tap `button` and wait until the alert is gone. */
  async dismiss(button = 'OK'): Promise<void> {
    await this.tapButton(button);
    await this.waitForIsShown(false);
  }
}

export default new NativeAlert();
