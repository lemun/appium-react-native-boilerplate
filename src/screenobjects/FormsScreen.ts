import AppScreen from './AppScreen.ts';
import Picker from './components/Picker.ts';
import { getByAccessibilityId } from '../helpers/Utils.ts';
import { hideKeyboard } from '../helpers/Keyboard.ts';

class FormsScreen extends AppScreen {
  constructor() {
    super('Forms-screen');
  }

  private get input() {
    return getByAccessibilityId('text-input');
  }

  /** The label that echoes whatever was typed into the input. */
  get inputResult() {
    return getByAccessibilityId('input-text-result');
  }

  private get switchControl() {
    return getByAccessibilityId('switch');
  }

  /** The hint below the switch ("Click to turn the switch ON/OFF"). */
  get switchText() {
    return getByAccessibilityId('switch-text');
  }

  private get dropdown() {
    return getByAccessibilityId('Dropdown');
  }

  private get dropdownChevron() {
    return getByAccessibilityId('dropdown-chevron');
  }

  private get activeButton() {
    return getByAccessibilityId('button-Active');
  }

  private get inactiveButton() {
    return getByAccessibilityId('button-Inactive');
  }

  async typeText(text: string): Promise<void> {
    await this.input.setValue(text);
    await hideKeyboard(this.inputResult);
  }

  async toggleSwitch(): Promise<void> {
    await this.switchControl.click();
  }

  /** Android reports `checked="true|false"`, iOS reports the switch value as `1|0`. */
  async isSwitchOn(): Promise<boolean> {
    return driver.isAndroid
      ? (await this.switchControl.getAttribute('checked')) === 'true'
      : (await this.switchControl.getAttribute('value')) === '1';
  }

  async selectDropdownOption(label: string): Promise<void> {
    // On iOS only the chevron opens the picker; on Android the whole field does.
    await (driver.isIOS ? this.dropdownChevron : this.dropdown).click();
    await Picker.select(label);
  }

  /** The currently selected dropdown label (empty string when nothing is selected). */
  async dropdownValue(): Promise<string> {
    const field = driver.isAndroid
      ? $('//*[@content-desc="Dropdown"]//android.widget.EditText')
      : $('-ios class chain:**/*[`name == "Dropdown"`]/**/XCUIElementTypeTextField');

    return field.getText();
  }

  async tapActiveButton(): Promise<void> {
    await this.activeButton.scrollIntoView({ scrollableElement: this.root });
    await this.activeButton.click();
  }

  async tapInactiveButton(): Promise<void> {
    await this.inactiveButton.scrollIntoView({ scrollableElement: this.root });
    await this.inactiveButton.click();
  }
}

export default new FormsScreen();
