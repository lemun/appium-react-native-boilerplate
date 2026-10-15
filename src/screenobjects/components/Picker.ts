const IOS_PICKER_WHEEL = "-ios predicate string:type == 'XCUIElementTypePickerWheel'";
const IOS_DONE = '~done_button';
const ANDROID_LIST = 'android=new UiSelector().className("android.widget.ListView")';

/**
 * The native picker opened by a React Native select (iOS picker wheel, Android list dialog).
 */
class Picker {
  async waitForIsShown(isShown = true): Promise<void> {
    await $(driver.isIOS ? IOS_PICKER_WHEEL : ANDROID_LIST).waitForExist({ timeout: 10_000, reverse: !isShown });
  }

  /** Pick an option by its visible label and wait for the picker to close. */
  async select(label: string): Promise<void> {
    await this.waitForIsShown();

    if (driver.isIOS) {
      // addValue (not setValue): a picker wheel cannot be cleared first.
      await $(IOS_PICKER_WHEEL).addValue(label);
      await $(IOS_DONE).click();
    } else {
      await $(`android=new UiSelector().className("android.widget.CheckedTextView").text("${label}")`).click();
    }

    await this.waitForIsShown(false);
  }
}

export default new Picker();
